CREATE TABLE users (
 id SERIAL PRIMARY KEY,
 username VARCHAR(50) NOT NULL,
 email VARCHAR(100) UNIQUE NOT NULL,
 password TEXT NOT NULL,
 bio TEXT,
 age INT,
 country VARCHAR(50),
 premium BOOLEAN DEFAULT FALSE
);

CREATE TABLE communities (
 id SERIAL PRIMARY KEY,
 name VARCHAR(100),
 description TEXT
);

CREATE TABLE posts (
 id SERIAL PRIMARY KEY,
 user_id INT REFERENCES users(id),
 community_id INT REFERENCES communities(id),
 content TEXT,
 type VARCHAR(20),
 quality_score FLOAT DEFAULT 0,
 created_at TIMESTAMP DEFAULT NOW()
);