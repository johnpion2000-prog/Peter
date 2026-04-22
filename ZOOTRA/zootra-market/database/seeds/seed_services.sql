-- Seed: seed_services.sql
-- Sample service provider listings

INSERT INTO services (id, user_id, service_type, description, price, availability, is_verified, status) VALUES
  ('svc-001', 'usr-002', 'vet',        'Licensed veterinarian specialising in large animals. Farm visits available.', 15000.00, '{"days":["Mon","Tue","Wed","Thu","Fri"],"hours":"08:00-17:00"}', TRUE,  'approved'),
  ('svc-002', 'usr-002', 'groomer',    'Professional pet grooming – bath, trim, nail clipping. Mobile service.',       8000.00, '{"days":["Mon","Wed","Fri","Sat"],"hours":"09:00-18:00"}',      FALSE, 'pending'),
  ('svc-003', 'usr-002', 'trainer',    'Certified dog & livestock trainer. Group and individual sessions.',            12000.00, '{"days":["Sat","Sun"],"hours":"07:00-14:00"}',                  TRUE,  'approved'),
  ('svc-004', 'usr-002', 'consultant', 'Farm management consultancy for poultry and dairy operations.',                20000.00, '{"days":["Mon","Thu"],"hours":"10:00-16:00"}',                  TRUE,  'approved'),
  ('svc-005', 'usr-002', 'transport',  'Safe livestock transport within Kigali and nearby provinces.',                 25000.00, '{"days":["Mon","Tue","Wed","Thu","Fri","Sat"],"hours":"06:00-20:00"}', FALSE, 'pending');
