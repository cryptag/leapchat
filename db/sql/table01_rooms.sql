CREATE TABLE rooms (
    room_id text NOT NULL UNIQUE PRIMARY KEY CHECK (40 <= LENGTH(room_id) AND LENGTH(room_id) <= 55)
);
ALTER TABLE rooms OWNER TO superuser;
