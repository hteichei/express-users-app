DROP DATABASE IF EXISTS "users_express_db";

CREATE DATABASE "users_express_db";

\c "users_express_db";

CREATE TABLE companies (id SERIAL PRIMARY KEY, name TEXT NOT NULL, logo TEXT, handle TEXT UNIQUE NOT NULL, password TEXT NOT NULL);

CREATE TABLE users (id SERIAL PRIMARY KEY, first_name TEXT NOT NULL, last_name TEXT NOT NULL, email TEXT NOT NULL, photo TEXT, username TEXT UNIQUE NOT NULL, password TEXT NOT NULL, current_company_id INTEGER NOT NULL REFERENCES companies ON DELETE SET NULL);

CREATE TABLE jobs (id SERIAL PRIMARY KEY, title TEXT NOT NULL, SALARY INTEGER, EQUITY NUMERIC, company_id INTEGER NOT NULL REFERENCES companies ON DELETE CASCADE);

CREATE TABLE jobs_users (id SERIAL PRIMARY KEY, job_id INTEGER REFERENCES jobs ON DELETE CASCADE, user_id INTEGER REFERENCES users ON DELETE CASCADE);

-- psql < schema.sql