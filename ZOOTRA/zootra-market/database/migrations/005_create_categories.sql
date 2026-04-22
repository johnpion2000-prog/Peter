-- Migration: 005_create_categories
-- Tables: categories, subcategories

CREATE TABLE IF NOT EXISTS categories (
    id         VARCHAR(36)  PRIMARY KEY DEFAULT (UUID()),
    name       VARCHAR(100) NOT NULL UNIQUE,
    parent_id  VARCHAR(36),
    sort_order INT          NOT NULL DEFAULT 0,
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) REFERENCES categories (id) ON DELETE SET NULL
);

CREATE INDEX idx_categories_parent_id ON categories (parent_id);

-- Subcategories table for deeper nesting (e.g. Cattle → Milk, Meat, Butter)
CREATE TABLE IF NOT EXISTS subcategories (
    id          VARCHAR(36)  PRIMARY KEY DEFAULT (UUID()),
    category_id VARCHAR(36)  NOT NULL,
    name        VARCHAR(100) NOT NULL,
    items       JSON,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_subcategories_category FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
);

CREATE INDEX idx_subcategories_category_id ON subcategories (category_id);
