export interface Semester {
  id: string;
  name: string;
  academicYear: string;
  registrationOpen: boolean;
  registrationDeadline: string;
}

export interface Schedule {
  id?: string;
  sessionType: "LEC" | "LAB" | "TUT";
  day: "MON" | "TUE" | "WED" | "THUR" | "FRI" | "SAT";
  startTime: string;
  endTime: string;
  venue: string | null;
  isOnline?: boolean;
}

export interface Unit {
  id: string;
  code: string;
  title: string;
  lecturer: string;
  department: string;
  departmentId: string;
  yearOfStudy: number;
  unitType: "core" | "elective";
  capacity: number;
  takenSeats: number;
  availableSeats: number;
  schedules: Schedule[];
}

export interface Department {
  id: string;
  name: string;
  code: string;
}

export interface Notice {
  id: string;
  title: string;
  body: string;
  postedBy: string;
  createdAt: string;
}

export interface DashboardStats {
  unitsRegistered: number;
  totalSlots: number;
  timetableClashes: number;
  daysToDeadline: number;
}

export interface RegisteredUnit {
  id: string;
  code: string;
  title: string;
  status: "pending" | "approved" | "rejected" | "dropped" | "completed";
  schedules: Schedule[];
}

export interface HistoryRow {
  semester: string;
  unitCode: string;
  unitTitle: string;
  lecturer: string;
  status: string;
  registeredAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: "student" | "admin";
  registrationNumber: string | null;
  course: string | null;
  yearOfStudy: number | null;
}
