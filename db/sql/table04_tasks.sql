CREATE TABLE tasks (
    id        uuid NOT NULL UNIQUE PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id   text NOT NULL REFERENCES rooms ON DELETE CASCADE,

    -- This is called 'title_enc' (encrypted title) but stores
    -- miniLock ciphertext, which can also store metadata
    title_enc text             NOT NULL,  -- base64-encoded ciphertext

    list_id   uuid             NOT NULL REFERENCES todo_lists ON DELETE CASCADE,
    index     double precision NOT NULL   -- index in the todo list with list_id

    -- ASSUMPTION: tasks don't expire and must be manually deleted by the user

    -- ASSUMPTION: no timestamp needed; better for user metadata privacy to not store it
);
ALTER TABLE tasks OWNER TO superuser;
