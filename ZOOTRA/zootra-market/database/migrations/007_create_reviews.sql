-- Migration: 007_create_reviews
-- Tables: reviews, whatsapp_logs

CREATE TABLE IF NOT EXISTS reviews (
    id         VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id    VARCHAR(36) NOT NULL,
    service_id VARCHAR(36) NOT NULL,
    rating     TINYINT     NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment    TEXT,
    created_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_reviews_user    FOREIGN KEY (user_id)    REFERENCES users     (id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_service FOREIGN KEY (service_id) REFERENCES services  (id) ON DELETE CASCADE
);

CREATE INDEX idx_reviews_user_id    ON reviews (user_id);
CREATE INDEX idx_reviews_service_id ON reviews (service_id);

-- WhatsApp interaction logs
CREATE TABLE IF NOT EXISTS whatsapp_logs (
    id         VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id    VARCHAR(36) NOT NULL,
    seller_id  VARCHAR(36) NOT NULL,
    product_id VARCHAR(36),
    timestamp  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_whatsapp_logs_user    FOREIGN KEY (user_id)    REFERENCES users    (id) ON DELETE CASCADE,
    CONSTRAINT fk_whatsapp_logs_seller  FOREIGN KEY (seller_id)  REFERENCES users    (id) ON DELETE CASCADE,
    CONSTRAINT fk_whatsapp_logs_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE SET NULL
);

CREATE INDEX idx_whatsapp_logs_user_id    ON whatsapp_logs (user_id);
CREATE INDEX idx_whatsapp_logs_seller_id  ON whatsapp_logs (seller_id);
CREATE INDEX idx_whatsapp_logs_timestamp  ON whatsapp_logs (timestamp);
