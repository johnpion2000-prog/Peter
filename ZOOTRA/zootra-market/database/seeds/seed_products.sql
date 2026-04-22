-- Seed: seed_products.sql
-- Sample product listings

INSERT INTO products (id, user_id, category_id, title, description, price, images, status) VALUES
  ('prd-001', 'usr-001', 'cat-011', 'Dairy Cow (Friesian)',     'High-yield Friesian dairy cow, 3 years old, healthy.', 850000.00, '[]', 'approved'),
  ('prd-002', 'usr-001', 'cat-012', 'Kigali Mountain Goats',   'Pack of 4 healthy mountain goats, vaccinated.',         240000.00, '[]', 'approved'),
  ('prd-003', 'usr-001', 'cat-014', 'Layer Hens (50 birds)',   '50 fully grown layer hens, producing daily.',            75000.00, '[]', 'approved'),
  ('prd-004', 'usr-001', 'cat-002', 'Maize Bran (50kg bag)',   'Premium quality maize bran for livestock feeding.',       8500.00, '[]', 'approved'),
  ('prd-005', 'usr-001', 'cat-003', 'Dog Food – Royal Canin',  'Royal Canin adult medium breed, 15kg bag.',              35000.00, '[]', 'pending');
