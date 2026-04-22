-- Migration: 004_create_bookings
-- Table: bookings

CREATE TABLE IF NOT EXISTS bookings (
    id               VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id          VARCHAR(36) NOT NULL,
    service_id       VARCHAR(36),
    product_id       VARCHAR(36),
    booking_date     DATE        NOT NULL,
    booking_time     TIME,
    status           ENUM('pending', 'confirmed', 'cancelled', 'completed') NOT NULL DEFAULT 'pending',
    whatsapp_chat_id VARCHAR(255),
    created_at       TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_bookings_user    FOREIGN KEY (user_id)    REFERENCES users     (id) ON DELETE CASCADE,
    CONSTRAINT fk_bookings_service FOREIGN KEY (service_id) REFERENCES services  (id) ON DELETE SET NULL,
    CONSTRAINT fk_bookings_product FOREIGN KEY (product_id) REFERENCES products  (id) ON DELETE SET NULL
);

CREATE INDEX idx_bookings_user_id    ON bookings (user_id);
CREATE INDEX idx_bookings_service_id ON bookings (service_id);
CREATE INDEX idx_bookings_status     ON bookings (status);
