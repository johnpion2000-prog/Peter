-- Seed: seed_users.sql
-- Initial platform users (passwords must be replaced with bcrypt hashes before running)

INSERT INTO users (id, name, email, phone, password, role, is_verified, location) VALUES
  ('usr-001', 'John Doe',   'john@example.com',  '+250788000001', '$2b$10$REPLACE_WITH_HASH', 'farmer',   TRUE,  'Kigali'),
  ('usr-002', 'Jane Smith', 'jane@example.com',  '+250788000002', '$2b$10$REPLACE_WITH_HASH', 'provider', FALSE, 'Kigali'),
  ('usr-003', 'Admin User', 'admin@zootra.com',  '+250788000003', '$2b$10$REPLACE_WITH_HASH', 'admin',    TRUE,  'Kigali'),
  ('usr-004', 'Alice K.',   'alice@example.com', '+250788000004', '$2b$10$REPLACE_WITH_HASH', 'buyer',    TRUE,  'Kigali');
