-- Seed: seed_categories.sql
-- Top-level categories and subcategories for Zootra Market

-- Top-level categories
INSERT INTO categories (id, name, parent_id, sort_order) VALUES
  ('cat-001', 'Livestock',      NULL, 1),
  ('cat-002', 'Feed',           NULL, 2),
  ('cat-003', 'Pet Products',   NULL, 3),
  ('cat-004', 'Animal Health',  NULL, 4);

-- Livestock subcategories (parent: Livestock)
INSERT INTO categories (id, name, parent_id, sort_order) VALUES
  ('cat-011', 'Cattle',   'cat-001', 1),
  ('cat-012', 'Goats',    'cat-001', 2),
  ('cat-013', 'Pigs',     'cat-001', 3),
  ('cat-014', 'Poultry',  'cat-001', 4);

-- Subcategory items
INSERT INTO subcategories (id, category_id, name, items) VALUES
  ('sub-001', 'cat-011', 'Cattle Products',  '["Milk", "Meat", "Butter"]'),
  ('sub-002', 'cat-012', 'Goat Products',    '["Milk", "Meat", "Skins"]'),
  ('sub-003', 'cat-013', 'Pig Products',     '["Meat", "Sausages"]'),
  ('sub-004', 'cat-014', 'Poultry Products', '["Eggs", "Chicken Meat", "Duck"]');
