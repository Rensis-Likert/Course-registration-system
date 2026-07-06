import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthedRequest } from "../middleware/auth";

const router = Router();

// GET /api/timetable?semesterId=...
// Returns the student's registered units' schedules, shaped for a weekly grid.
router.get("/", requireAuth, async (req: AuthedRequest, res) => {
  const userId = req.user!.userId;
  const { semesterId } = req.query as Record<string, string | undefined>;

  const semester = semesterId
    ? await prisma.semester.findUnique({ where: { id: semesterId } })
    : await prisma.semester.findFirst({ orderBy: { startDate: "desc" } });

  if (!semester) return res.json({ semester: null, entries: [] });

  const registrations = await prisma.registration.findMany({
    where: { userId, semesterId: semester.id, status: { in: ["pending", "approved"] } },
    include: { unit: { include: { schedules: true } } },
  });

  const entries = registrations.flatMap((r) =>
    r.unit.schedules.map((s) => ({
      unitCode: r.unit.code,
      unitTitle: r.unit.title,
      sessionType: s.sessionType,
      day: s.day,
      startTime: s.startTime,
      endTime: s.endTime,
      venue: s.isOnline ? "ONLINE" : s.venue,
    }))
  );

  return res.json({ semester, entries });
});

export default router;
