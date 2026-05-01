CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);

-- Test user with username: testuser@gmail.com, password: password123
INSERT INTO users (username, password_hash) VALUES ('testuser@gmail.com', '$2b$10$BfKAwDVE6Pw7Vjd9uuMqnOYwn4Zg8VL5tl49qs/eLa5/mfzsioTm.');
