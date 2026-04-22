-- Migration: 003_create_services
-- Table: services

CREATE TABLE IF NOT EXISTS services (
    id           VARCHAR(36)   PRIMARY KEY DEFAULT (UUID()),
    user_id      VARCHAR(36)   NOT NULL,
    service_type ENUM('vet', 'groomer', 'trainer', 'consultant', 'transport') NOT NULL,
    description  TEXT,
    price        DECIMAL(12,2) NOT NULL,
    availability JSON,
    is_verified  BOOLEAN       NOT NULL DEFAULT FALSE,
    status       ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    created_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_services_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX idx_services_user_id      ON services (user_id);
CREATE INDEX idx_services_service_type ON services (service_type);
CREATE INDEX idx_services_status       ON services (status);
