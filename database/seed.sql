-- Demo login: markirungu24@students.dkut.ac.ke / Password123!
--             registration number: C25-01-0489/2023

insert into departments (id, name, code) values
  ('11111111-1111-1111-1111-111111111101', 'Computing (CS)', 'CS'),
  ('11111111-1111-1111-1111-111111111102', 'Mathematics', 'MATH'),
  ('11111111-1111-1111-1111-111111111103', 'Engineering', 'ENG'),
  ('11111111-1111-1111-1111-111111111104', 'Physics', 'PHY'),
  ('11111111-1111-1111-1111-111111111105', 'IGS', 'IGS');


insert into semesters (id, name, academic_year, start_date, end_date, registration_open, registration_deadline) values
  ('22222222-2222-2222-2222-222222222201', 'Semester 1', '2025/26', '2026-05-01', '2026-08-31', true, '2026-07-15 23:59:00+03'),
  ('22222222-2222-2222-2222-222222222202', 'Semester 2', '2024/25', '2025-01-01', '2025-04-30', false, '2025-01-15 23:59:00+03');

insert into users (id, role, email, password_hash, full_name, registration_number, course, year_of_study, department_id) values
  ('33333333-3333-3333-3333-333333333301', 'student',
   'markirungu24@students.dkut.ac.ke',
   '$2b$10$4y2GJcW1Yq8H8UePOZ4C0uK9rXwZQ8p2p6QwQdE1n1Q9K3aXQ2j1e',
   'Mark Irungu', 'C026-01-0489/2024', 'BSc. Computer Science', 3,
   '11111111-1111-1111-1111-111111111101');

insert into users (id, role, email, password_hash, full_name, department_id) values
  ('33333333-3333-3333-3333-333333333302', 'admin',
   'registrar@dkut.ac.ke',
   '$2b$10$4y2GJcW1Yq8H8UePOZ4C0uK9rXwZQ8p2p6QwQdE1n1Q9K3aXQ2j1e',
   'Registrar Admin', '11111111-1111-1111-1111-111111111101');


insert into units (id, code, title, lecturer, department_id, year_of_study, unit_type, capacity, semester_id) values
  ('44444444-0000-0000-0000-000000000001', 'CCS 3101', 'Artificial Intelligence', 'Mr. Kaburu', '11111111-1111-1111-1111-111111111101', 3, 'core', 110, '22222222-2222-2222-2222-222222222201'),
  ('44444444-0000-0000-0000-000000000002', 'CCS 3102', 'Design and Analysis of Algorithms', 'Mr. David', '11111111-1111-1111-1111-111111111101', 3, 'core', 110, '22222222-2222-2222-2222-222222222201'),
  ('44444444-0000-0000-0000-000000000003', 'CCS 3103', 'Distributed Systems', 'Dr. Moso', '11111111-1111-1111-1111-111111111101', 3, 'core', 110, '22222222-2222-2222-2222-222222222201'),
  ('44444444-0000-0000-0000-000000000004', 'CCS 3104', 'Theory of Computing', 'Dr. Kituku', '11111111-1111-1111-1111-111111111101', 3, 'core', 110, '22222222-2222-2222-2222-222222222201'),
  ('44444444-0000-0000-0000-000000000005', 'CCS 3105', 'Systems Programming', 'Dr. Musumba', '11111111-1111-1111-1111-111111111101', 3, 'core', 110, '22222222-2222-2222-2222-222222222201'),
  ('44444444-0000-0000-0000-000000000006', 'CCS 3106', 'Software Engineering', 'Mr. Kaburu', '11111111-1111-1111-1111-111111111101', 3, 'core', 110, '22222222-2222-2222-2222-222222222201'),
  ('44444444-0000-0000-0000-000000000007', 'IGS 3101', 'Traditional African Studies', 'IGS', '11111111-1111-1111-1111-111111111105', 3, 'core', 110, '22222222-2222-2222-2222-222222222201'),
  ('44444444-0000-0000-0000-000000000008', 'IEE 3107', 'Digital Logic Design', 'Mr. Samuel', '11111111-1111-1111-1111-111111111103', 3, 'core', 110, '22222222-2222-2222-2222-222222222201'),
  ('44444444-0000-0000-0000-000000000009', 'SMA 3102', 'Vector Analysis', 'Dr. Amenya', '11111111-1111-1111-1111-111111111102', 3, 'core', 110, '22222222-2222-2222-2222-222222222201');


insert into unit_schedules (unit_id, session_type, day, start_time, end_time, venue, is_online) values
  ('44444444-0000-0000-0000-000000000001', 'LEC', 'MON',  '11:00', '13:00', 'RC 18', false),
  ('44444444-0000-0000-0000-000000000001', 'LAB', 'THUR', '14:00', '17:00', 'RCL 1', false),

  ('44444444-0000-0000-0000-000000000002', 'LEC', 'MON',  '14:00', '16:00', 'AUD',  false),
  ('44444444-0000-0000-0000-000000000002', 'LAB', 'THUR', '11:00', '14:00', 'RCL 1', false),

  ('44444444-0000-0000-0000-000000000003', 'LEC', 'TUE',  '11:00', '13:00', 'RC 18', false),
  ('44444444-0000-0000-0000-000000000003', 'LAB', 'THUR', '08:00', '11:00', 'RCL 1', false),

  ('44444444-0000-0000-0000-000000000004', 'LEC', 'WED',  '09:00', '11:00', 'RC 18', false),
  ('44444444-0000-0000-0000-000000000004', 'LAB', 'WED',  '14:00', '17:00', 'RCL 1', false),

  ('44444444-0000-0000-0000-000000000005', 'LEC', 'TUE',  '14:00', '16:00', 'RC 18', false),
  ('44444444-0000-0000-0000-000000000005', 'LAB', 'FRI',  '11:00', '14:00', 'RCL 1', false),

  ('44444444-0000-0000-0000-000000000006', 'LEC', 'WED',  '11:00', '13:00', 'RC 18', false),
  ('44444444-0000-0000-0000-000000000006', 'LAB', 'FRI',  '08:00', '11:00', 'RCL 1', false),

  ('44444444-0000-0000-0000-000000000007', 'LEC', 'THUR', '17:00', '18:00', null, true),
  ('44444444-0000-0000-0000-000000000007', 'LAB', 'FRI',  '14:00', '16:00', null, true),

  ('44444444-0000-0000-0000-000000000008', 'LEC', 'TUE',  '14:00', '16:00', 'SOE 1', false),
  ('44444444-0000-0000-0000-000000000008', 'LAB', 'FRI',  '11:00', '14:00', 'EL 1', false),

  ('44444444-0000-0000-0000-000000000009', 'LEC', 'THUR', '09:00', '11:00', 'RC 18', false),
  ('44444444-0000-0000-0000-000000000009', 'TUT', 'THUR', '13:00', '15:00', 'RC 3', false);


insert into registrations (user_id, unit_id, semester_id, status) values
  ('33333333-3333-3333-3333-333333333301', '44444444-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222201', 'pending'),
  ('33333333-3333-3333-3333-333333333301', '44444444-0000-0000-0000-000000000006', '22222222-2222-2222-2222-222222222201', 'pending');


insert into units (id, code, title, lecturer, department_id, year_of_study, unit_type, capacity, semester_id) values
  ('44444444-0000-0000-0000-000000000010', 'CCS 2201', 'Data Structures and Algorithms', 'Dr. Kerugoya', '11111111-1111-1111-1111-111111111101', 2, 'core', 110, '22222222-2222-2222-2222-222222222202');

insert into registrations (user_id, unit_id, semester_id, status, decided_at) values
  ('33333333-3333-3333-3333-333333333301', '44444444-0000-0000-0000-000000000010', '22222222-2222-2222-2222-222222222202', 'completed', '2025-04-30 00:00:00+03');


insert into notices (title, body, posted_by, semester_id) values
  ('Registration Closes 15 July 2026', 'Ensure all units are confirmed before the deadline. Late submissions will not be accepted.', 'Registrar', '22222222-2222-2222-2222-222222222201'),
  ('CCS 3103 venue changed', 'Distributed Systems LAB moves from NTC 20 to RCL 1 effective Monday 8 July.', 'Dean CS Dept.', '22222222-2222-2222-2222-222222222201'),
  ('IGS 3101 is fully online', 'No physical attendance required. Webinar link will be shared via student email every week.', 'IGS dept.', '22222222-2222-2222-2222-222222222201');
