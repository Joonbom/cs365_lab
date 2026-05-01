CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);

-- Test user with username: testuser, password: password123
INSERT INTO users (username, password_hash) VALUES ('testuser', '$2b$10$EP36v2i4hIuV0v4/9R50cOH7kC8I3r2yN2F.zZ9Xj0q.tN1C2iQp6');
