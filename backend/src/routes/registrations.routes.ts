import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthedRequest } from "../middleware/auth";

const router = Router();

const registerSchema = z.object({
  unitId: z.string().uuid(),
  semesterId: z.string().uuid(),
});

function timesOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && bStart < aEnd;
}

// Checks whether adding `newUnitId` would clash with the student's
// already-registered units in the same semester (same day, overlapping time).
async function findOverlaps(userId: string, semesterId: string, newUnitId: string) {
  const [existingSchedules, newUnitSchedules] = await Promise.all([
    prisma.unitSchedule.findMany({
      where: {
        unit: {
          registrations: {
            some: { userId, semesterId, status: { in: ["pending", "approved"] } },
          },
        },
      },
      include: { unit: true },
    }),
    prisma.unitSchedule.findMany({ where: { unitId: newUnitId } }),
  ]);

  const overlaps: Array<{ withUnitCode: string; day: string }> = [];
  for (const ns of newUnitSchedules) {
    for (const es of existingSchedules) {
      if (es.day === ns.day && timesOverlap(es.startTime, es.endTime, ns.startTime, ns.endTime)) {
        overlaps.push({ withUnitCode: es.unit.code, day: ns.day });
      }
    }
  }
  return overlaps;
}

// GET /api/registrations/me?semesterId=...  -> current student's registrations
router.get("/me", requireAuth, async (req: AuthedRequest, res) => {
  const userId = req.user!.userId;
  const { semesterId } = req.query as Record<string, string | undefined>;

  const semester = semesterId
    ? await prisma.semester.findUnique({ where: { id: semesterId } })
    : await prisma.semester.findFirst({ orderBy: { startDate: "desc" } });

  if (!semester) return res.json({ semester: null, registrations: [] });

  const registrations = await prisma.registration.findMany({
    where: { userId, semesterId: semester.id },
    include: { unit: { include: { schedules: true, department: true } } },
    orderBy: { registeredAt: "asc" },
  });

  return res.json({ semester, registrations });
});

// POST /api/registrations  -> add a unit (status: pending), blocked by overlap/capacity
router.post("/", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "unitId and semesterId are required." });
  const { unitId, semesterId } = parsed.data;
  const userId = req.user!.userId;

  const semester = await prisma.semester.findUnique({ where: { id: semesterId } });
  if (!semester) return res.status(404).json({ error: "Semester not found." });
  if (!semester.registrationOpen) {
    return res.status(400).json({ error: "Registration is closed for this semester." });
  }

  const unit = await prisma.unit.findUnique({
    where: { id: unitId },
    include: { registrations: { where: { status: { in: ["pending", "approved"] } } } },
  });
  if (!unit) return res.status(404).json({ error: "Unit not found." });

  if (unit.registrations.length >= unit.capacity) {
    return res.status(400).json({ error: "This unit is full. There are no available seats left." });
  }

  const overlaps = await findOverlaps(userId, semesterId, unitId);
  if (overlaps.length > 0) {
    return res.status(409).json({
      error: "This unit clashes with a unit already on your timetable.",
      overlaps,
    });
  }

  try {
    const registration = await prisma.registration.create({
      data: { userId, unitId, semesterId, status: "pending" },
    });
    return res.status(201).json({ registration });
  } catch (err: any) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "You are already registered for this unit this semester." });
    }
    throw err;
  }
});

// DELETE /api/registrations/:unitId?semesterId=...  -> drop a unit
router.delete("/:unitId", requireAuth, async (req: AuthedRequest, res) => {
  const userId = req.user!.userId;
  const { unitId } = req.params;
  const { semesterId } = req.query as Record<string, string | undefined>;
  if (!semesterId) return res.status(400).json({ error: "semesterId query param is required." });

  const registration = await prisma.registration.findUnique({
    where: { userId_unitId_semesterId: { userId, unitId, semesterId } },
  });
  if (!registration) return res.status(404).json({ error: "Registration not found." });

  await prisma.registration.update({
    where: { id: registration.id },
    data: { status: "dropped" },
  });

  return res.json({ ok: true });
});

// POST /api/registrations/confirm  -> student confirms their selected units (pending -> approved)
// In a real deployment approval might be a separate admin step; here "confirm" locks in the
// student's selection for the semester, matching the "Confirm Registration" button in the mock.
router.post("/confirm", requireAuth, async (req: AuthedRequest, res) => {
  const userId = req.user!.userId;
  const { semesterId } = z.object({ semesterId: z.string().uuid() }).parse(req.body);

  const updated = await prisma.registration.updateMany({
    where: { userId, semesterId, status: "pending" },
    data: { status: "approved", decidedAt: new Date() },
  });

  return res.json({ confirmed: updated.count });
});

export default router;
