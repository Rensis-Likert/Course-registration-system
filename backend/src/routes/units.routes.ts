import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthedRequest } from "../middleware/auth";

const router = Router();

// GET /api/units?semesterId=...&departmentId=...&year=...&q=...
// Returns the unit catalog with schedules, department, and available-seat counts.
router.get("/", requireAuth, async (req, res) => {
  const { semesterId, departmentId, year, q } = req.query as Record<string, string | undefined>;

  const semester = semesterId
    ? await prisma.semester.findUnique({ where: { id: semesterId } })
    : await prisma.semester.findFirst({ orderBy: { startDate: "desc" } });

  if (!semester) {
    return res.json({ semester: null, units: [] });
  }

  const units = await prisma.unit.findMany({
    where: {
      semesterId: semester.id,
      ...(departmentId ? { departmentId } : {}),
      ...(year ? { yearOfStudy: Number(year) } : {}),
      ...(q
        ? {
            OR: [
              { code: { contains: q, mode: "insensitive" } },
              { title: { contains: q, mode: "insensitive" } },
              { lecturer: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      department: true,
      schedules: true,
      registrations: {
        where: { status: { in: ["pending", "approved"] } },
      },
    },
    orderBy: { code: "asc" },
  });

  const shaped = units.map((u) => ({
    id: u.id,
    code: u.code,
    title: u.title,
    lecturer: u.lecturer,
    department: u.department.name,
    departmentId: u.departmentId,
    yearOfStudy: u.yearOfStudy,
    unitType: u.unitType,
    capacity: u.capacity,
    takenSeats: u.registrations.length,
    availableSeats: u.capacity - u.registrations.length,
    schedules: u.schedules.map((s) => ({
      id: s.id,
      sessionType: s.sessionType,
      day: s.day,
      startTime: s.startTime,
      endTime: s.endTime,
      venue: s.venue,
      isOnline: s.isOnline,
    })),
  }));

  return res.json({ semester, units: shaped });
});

// GET /api/units/departments -> list of departments for the filter sidebar
router.get("/departments", requireAuth, async (_req, res) => {
  const departments = await prisma.department.findMany({ orderBy: { name: "asc" } });
  return res.json({ departments });
});

export default router;
