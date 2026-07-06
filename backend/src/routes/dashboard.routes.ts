import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthedRequest } from "../middleware/auth";

const router = Router();

function timesOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && bStart < aEnd;
}

// GET /api/dashboard?semesterId=...
// Powers the summary cards + "Registered Units" list on the Dashboard screen.
router.get("/", requireAuth, async (req: AuthedRequest, res) => {
  const userId = req.user!.userId;
  const { semesterId } = req.query as Record<string, string | undefined>;

  const semester = semesterId
    ? await prisma.semester.findUnique({ where: { id: semesterId } })
    : await prisma.semester.findFirst({ orderBy: { startDate: "desc" } });

  if (!semester) return res.json({ semester: null });

  const [user, registrations] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.registration.findMany({
      where: { userId, semesterId: semester.id, status: { in: ["pending", "approved"] } },
      include: { unit: { include: { schedules: true } } },
    }),
  ]);

  const allSchedules = registrations.flatMap((r) => r.unit.schedules.map((s) => ({ ...s, unitCode: r.unit.code })));
  let clashes = 0;
  for (let i = 0; i < allSchedules.length; i++) {
    for (let j = i + 1; j < allSchedules.length; j++) {
      const a = allSchedules[i];
      const b = allSchedules[j];
      if (a.unitCode !== b.unitCode && a.day === b.day && timesOverlap(a.startTime, a.endTime, b.startTime, b.endTime)) {
        clashes++;
      }
    }
  }

  const totalSlots = registrations.reduce((sum, r) => sum + r.unit.schedules.length, 0);
  const now = new Date();
  const daysToDeadline = Math.max(
    0,
    Math.ceil((semester.registrationDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  );

  return res.json({
    semester,
    student: user
      ? {
          fullName: user.fullName,
          course: user.course,
          yearOfStudy: user.yearOfStudy,
        }
      : null,
    stats: {
      unitsRegistered: registrations.length,
      totalSlots,
      timetableClashes: clashes,
      daysToDeadline,
    },
    registeredUnits: registrations.map((r) => ({
      id: r.unit.id,
      code: r.unit.code,
      title: r.unit.title,
      status: r.status,
      schedules: r.unit.schedules,
    })),
  });
});

export default router;
