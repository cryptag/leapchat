CREATE USER superuser WITH PASSWORD 'superuser';
CREATE DATABASE leapchat OWNER superuser ENCODING 'UTF8';
GRANT ALL ON DATABASE leapchat TO superuser;
ALTER USER superuser CREATEDB;
