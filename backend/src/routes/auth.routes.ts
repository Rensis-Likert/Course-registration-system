import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { signToken } from "../utils/jwt";

const router = Router();

const studentLoginSchema = z.object({
  email: z.string().email(),
  registrationNumber: z.string().min(3),
  password: z.string().min(6),
});

const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(2),
  registrationNumber: z.string().min(3),
  course: z.string().optional(),
  yearOfStudy: z.number().int().min(1).max(6).optional(),
  departmentId: z.string().uuid().optional(),
});

function toPublicUser(user: {
  id: string;
  email: string;
  fullName: string;
  role: string;
  registrationNumber: string | null;
  course: string | null;
  yearOfStudy: number | null;
}) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    registrationNumber: user.registrationNumber,
    course: user.course,
    yearOfStudy: user.yearOfStudy,
  };
}

// POST /api/auth/register  (student sign-up)
router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input.", details: parsed.error.flatten() });
  }
  const { email, password, fullName, registrationNumber, course, yearOfStudy, departmentId } = parsed.data;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { registrationNumber }] },
  });
  if (existing) {
    return res.status(409).json({ error: "An account with that email or registration number already exists." });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      fullName,
      registrationNumber,
      course,
      yearOfStudy,
      departmentId,
      role: "student",
    },
  });

  const token = signToken({ userId: user.id, role: "student" });
  return res.status(201).json({ token, user: toPublicUser(user) });
});

// POST /api/auth/login/student
router.post("/login/student", async (req, res) => {
  const parsed = studentLoginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Enter a valid student email, registration number and password." });
  }
  const { email, registrationNumber, password } = parsed.data;

  const user = await prisma.user.findFirst({ where: { email, registrationNumber, role: "student" } });
  if (!user) {
    return res.status(401).json({ error: "No account matches that email and registration number." });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Incorrect password." });
  }

  const token = signToken({ userId: user.id, role: "student" });
  return res.json({ token, user: toPublicUser(user) });
});

// POST /api/auth/login/admin
router.post("/login/admin", async (req, res) => {
  const parsed = adminLoginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Enter a valid email and password." });
  }
  const { email, password } = parsed.data;

  const user = await prisma.user.findFirst({ where: { email, role: "admin" } });
  if (!user) {
    return res.status(401).json({ error: "No admin/staff account matches that email." });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Incorrect password." });
  }

  const token = signToken({ userId: user.id, role: "admin" });
  return res.json({ token, user: toPublicUser(user) });
});

export default router;
