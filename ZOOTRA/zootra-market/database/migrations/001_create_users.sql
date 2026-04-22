-- Migration: 001_create_users
-- Table: users

CREATE TABLE IF NOT EXISTS users (
    id            VARCHAR(36)   PRIMARY KEY DEFAULT (UUID()),
    name          VARCHAR(150)  NOT NULL,
    email         VARCHAR(255)  NOT NULL UNIQUE,
    phone         VARCHAR(20)   NOT NULL,
    password      VARCHAR(255)  NOT NULL,
    role          ENUM('farmer', 'provider', 'admin', 'buyer') NOT NULL DEFAULT 'buyer',
    is_verified   BOOLEAN       NOT NULL DEFAULT FALSE,
    verification_document VARCHAR(500),
    location      VARCHAR(150)  NOT NULL DEFAULT 'Kigali',
    created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email  ON users (email);
CREATE INDEX idx_users_role   ON users (role);
