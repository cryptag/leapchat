CREATE TABLE messages (
    message_id  uuid      NOT NULL UNIQUE PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id     text      NOT NULL REFERENCES rooms ON DELETE CASCADE,
    message     text      NOT NULL,
    message_enc bytea     NOT NULL,
    ttl_secs    integer   DEFAULT 7776000 CHECK (60 <= ttl_secs AND ttl_secs <= 7776000),
    created     timestamp WITH time zone DEFAULT now()
);
ALTER TABLE messages OWNER TO superuser;
