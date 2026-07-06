import "dotenv/config";
import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import unitsRoutes from "./routes/units.routes";
import registrationsRoutes from "./routes/registrations.routes";
import timetableRoutes from "./routes/timetable.routes";
import historyRoutes from "./routes/history.routes";
import noticesRoutes from "./routes/notices.routes";
import dashboardRoutes from "./routes/dashboard.routes";

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim());

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true, service: "dekut-unit-reg-backend" }));

app.use("/api/auth", authRoutes);
app.use("/api/units", unitsRoutes);
app.use("/api/registrations", registrationsRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/notices", noticesRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Fallback 404
app.use((_req, res) => res.status(404).json({ error: "Not found." }));

// Basic error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong on the server." });
});

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  console.log(`DeKUT Unit Reg API listening on port ${PORT}`);
});
