-- Migration: 006_create_messages
-- Table: messages

CREATE TABLE IF NOT EXISTS messages (
    id           VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    from_user_id VARCHAR(36) NOT NULL,
    to_user_id   VARCHAR(36) NOT NULL,
    content      TEXT        NOT NULL,
    is_read      BOOLEAN     NOT NULL DEFAULT FALSE,
    timestamp    TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_messages_from FOREIGN KEY (from_user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_messages_to   FOREIGN KEY (to_user_id)   REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX idx_messages_from_user_id ON messages (from_user_id);
CREATE INDEX idx_messages_to_user_id   ON messages (to_user_id);
CREATE INDEX idx_messages_timestamp    ON messages (timestamp);
