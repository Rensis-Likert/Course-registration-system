import jwt from "jsonwebtoken";

export interface AuthTokenPayload {
  userId: string;
  role: "student" | "admin";
}

const SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const EXPIRES_IN = (process.env.JWT_EXPIRES_IN || "7d") as jwt.SignOptions["expiresIn"];

export function signToken(payload: AuthTokenPayload): string {
  const options: jwt.SignOptions = { expiresIn: EXPIRES_IN };
  return jwt.sign(payload, SECRET, options);
}

export function verifyToken(token: string): AuthTokenPayload {
  return jwt.verify(token, SECRET) as AuthTokenPayload;
}
