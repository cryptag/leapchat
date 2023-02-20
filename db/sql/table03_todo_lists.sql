CREATE TABLE todo_lists (
    id        uuid NOT NULL UNIQUE PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id   text NOT NULL REFERENCES rooms ON DELETE CASCADE,

    -- This is called 'title_enc' (encrypted title) but stores
    -- miniLock ciphertext, which can also store metadata
    title_enc text NOT NULL  -- base64-encoded ciphertext

    -- ASSUMPTION: todo lists don't expire and must be manually deleted by the user

    -- ASSUMPTION: no timestamp needed; better for user metadata privacy to not store it
);
ALTER TABLE todo_lists OWNER TO superuser;
