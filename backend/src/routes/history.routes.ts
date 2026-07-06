import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthedRequest } from "../middleware/auth";

const router = Router();

// GET /api/history -> all of the student's registrations across all semesters
router.get("/", requireAuth, async (req: AuthedRequest, res) => {
  const userId = req.user!.userId;

  const registrations = await prisma.registration.findMany({
    where: { userId },
    include: { unit: true, semester: true },
    orderBy: [{ semester: { startDate: "desc" } }, { registeredAt: "asc" }],
  });

  const rows = registrations.map((r) => ({
    semester: `${r.semester.name} - ${r.semester.academicYear}`,
    unitCode: r.unit.code,
    unitTitle: r.unit.title,
    lecturer: r.unit.lecturer,
    status: r.status,
    registeredAt: r.registeredAt,
  }));

  return res.json({ history: rows });
});

export default router;
