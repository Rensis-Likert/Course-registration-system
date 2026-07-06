import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";

const router = Router();

// GET /api/notices?semesterId=...
router.get("/", requireAuth, async (req, res) => {
  const { semesterId } = req.query as Record<string, string | undefined>;

  const semester = semesterId
    ? await prisma.semester.findUnique({ where: { id: semesterId } })
    : await prisma.semester.findFirst({ orderBy: { startDate: "desc" } });

  if (!semester) return res.json({ notices: [] });

  const notices = await prisma.notice.findMany({
    where: { semesterId: semester.id },
    orderBy: { createdAt: "desc" },
  });

  return res.json({ notices });
});

export default router;
