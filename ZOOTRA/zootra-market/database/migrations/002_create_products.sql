-- Migration: 002_create_products
-- Table: products

CREATE TABLE IF NOT EXISTS products (
    id          VARCHAR(36)   PRIMARY KEY DEFAULT (UUID()),
    user_id     VARCHAR(36)   NOT NULL,
    category_id VARCHAR(36)   NOT NULL,
    title       VARCHAR(255)  NOT NULL,
    description TEXT,
    price       DECIMAL(12,2) NOT NULL,
    images      JSON,
    status      ENUM('pending', 'approved', 'rejected', 'sold') NOT NULL DEFAULT 'pending',
    created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_products_user     FOREIGN KEY (user_id)     REFERENCES users (id)       ON DELETE CASCADE,
    CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories (id)  ON DELETE RESTRICT
);

CREATE INDEX idx_products_user_id     ON products (user_id);
CREATE INDEX idx_products_category_id ON products (category_id);
CREATE INDEX idx_products_status      ON products (status);
