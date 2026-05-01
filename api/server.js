const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());

// Set up PostgreSQL connection
const pool = new Pool({
  user: process.env.DB_USER || 'myuser',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'mydb',
  password: process.env.DB_PASSWORD || 'mypassword',
  port: process.env.DB_PORT || 5432,
});

// API for user login and password validation
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  // 1. Check if all required data is provided
  if (!username || !password) {
    return res.status(400).json({ error: 'Please provide Username and Password' });
  }

  // 2. Validate password conditions (length >= 8 and contains >= 1 number)
  const hasNumber = /\d/;
  if (password.length < 8 || !hasNumber.test(password)) {
    return res.status(400).json({ 
      error: 'Password must be at least 8 characters long and contain at least 1 number' 
    });
  }

  try {
    // 3. Find user data in PostgreSQL
    const selectQuery = `
      SELECT id, username, password_hash 
      FROM users 
      WHERE username = $1
    `;
    const result = await pool.query(selectQuery, [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid Username or Password' });
    }

    const user = result.rows[0];

    // 4. Verify password against Hash in Database
    const isMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid Username or Password' });
    }

    // 5. Send successful response
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username
      }
    });

  } catch (error) {
    console.error('Database Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const PORT = 3000;
// Check if this file is run directly (node server.js) or required by another file (like Jest)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Export app for Supertest usage
module.exports = app;