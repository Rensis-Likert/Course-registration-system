
create extension if not exists "pgcrypto";


-- ENUM TYPES
create type user_role as enum ('student', 'admin');
create type unit_type as enum ('core', 'elective');
create type session_type as enum ('LEC', 'LAB', 'TUT');
create type day_of_week as enum ('MON', 'TUE', 'WED', 'THUR', 'FRI', 'SAT');
create type registration_status as enum ('pending', 'approved', 'rejected', 'dropped', 'completed');


-- DEPARTMENTS
create table departments (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  code        text not null unique,
  created_at  timestamptz not null default now()
);


-- USERS  (students + admin/staff, distinguished by role)
create table users (
  id                  uuid primary key default gen_random_uuid(),
  role                user_role not null default 'student',
  email               text not null unique,
  password_hash       text not null,
  full_name           text not null,
  registration_number text unique,             
  course              text,                     
  year_of_study       int,                      
  department_id       uuid references departments(id),
  created_at          timestamptz not null default now()
);


-- SEMESTERS  (registration windows)
create table semesters (
  id                     uuid primary key default gen_random_uuid(),
  name                   text not null,          -- e.g. "Semester 1"
  academic_year          text not null,          -- e.g. "2025/26"
  start_date             date not null,
  end_date               date not null,
  registration_open      boolean not null default false,
  registration_deadline  timestamptz not null,
  created_at             timestamptz not null default now(),
  unique (name, academic_year)
);


-- UNITS  (course units offered in a given semester)
create table units (
  id             uuid primary key default gen_random_uuid(),
  code           text not null,                  -- e.g. "CCS 3102"
  title          text not null,                  -- e.g. "Design and Analysis of Algorithms"
  lecturer       text not null,
  department_id  uuid not null references departments(id),
  year_of_study  int not null,
  unit_type      unit_type not null default 'core',
  capacity       int not null default 110,
  semester_id    uuid not null references semesters(id) on delete cascade,
  created_at     timestamptz not null default now(),
  unique (code, semester_id)
);


-- UNIT SCHEDULES  (lecture / lab / tutorial slots -> timetable)
create table unit_schedules (
  id           uuid primary key default gen_random_uuid(),
  unit_id      uuid not null references units(id) on delete cascade,
  session_type session_type not null,
  day          day_of_week not null,
  start_time   time not null,
  end_time     time not null,
  venue        text,
  is_online    boolean not null default false
);


-- REGISTRATIONS  (a student's unit registrations per semester)
create table registrations (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references users(id) on delete cascade,
  unit_id        uuid not null references units(id) on delete cascade,
  semester_id    uuid not null references semesters(id) on delete cascade,
  status         registration_status not null default 'pending',
  registered_at  timestamptz not null default now(),
  decided_at     timestamptz,
  unique (user_id, unit_id, semester_id)
);


-- NOTICES  (dashboard announcements)
create table notices (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  body         text not null,
  posted_by    text not null,          -- e.g. "Registrar", "Dean CS Dept."
  semester_id  uuid references semesters(id),
  created_at   timestamptz not null default now()
);


-- HELPFUL INDEXES
create index idx_units_semester on units(semester_id);
create index idx_units_department on units(department_id);
create index idx_schedules_unit on unit_schedules(unit_id);
create index idx_registrations_user on registrations(user_id);
create index idx_registrations_semester on registrations(semester_id);
create index idx_notices_semester on notices(semester_id);


-- CONSTRAINT: capacity check helper view (available seats)
create view unit_available_seats as
select
  u.id as unit_id,
  u.capacity,
  count(r.id) filter (where r.status in ('pending', 'approved')) as taken,
  u.capacity - count(r.id) filter (where r.status in ('pending', 'approved')) as available
from units u
left join registrations r on r.unit_id = u.id
group by u.id, u.capacity;
