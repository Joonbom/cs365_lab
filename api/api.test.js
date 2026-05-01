const request = require('supertest');
const bcrypt = require('bcrypt');

// Mock pg module before requiring './server'
jest.mock('pg', () => {
  const mPool = {
    query: jest.fn(),
  };
  return { Pool: jest.fn(() => mPool) };
});

const app = require('./server'); // Import our Express app
const { Pool } = require('pg');

describe('POST /api/login - Test login system', () => {
  let pool;
  
  beforeEach(() => {
    pool = new Pool();
    pool.query.mockClear();
  });
  
  const testUser = 'testuser123';
  const testPassword = 'ValidPassword123';

  it('should login successfully with valid data (Status 200)', async () => {
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    // Set the return value for the database when a user is found
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1, username: testUser, password_hash: hashedPassword }] });

    const response = await request(app)
      .post('/api/login')
      .send({
        username: testUser,
        password: testPassword
      });

    // Check if Status Code is 200 OK
    expect(response.statusCode).toBe(200);
    
    // Check the response data structure
    expect(response.body).toHaveProperty('message', 'Login successful');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user.username).toBe(testUser);
  });

  it('should return Error if password is less than 8 characters (Status 400)', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({
        username: 'user_short_pass',
        password: 'Pass1' // Only 5 characters long
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('at least 8 characters long');
  });

  it('should return Error if password does not contain a number (Status 400)', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({
        username: 'user_no_number',
        password: 'PasswordWithoutNumber'
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('contain at least 1 number');
  });

  it('should return Error if Username or Password is not provided (Status 400)', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({
        username: 'only_username'
        // password is not provided
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error', 'Please provide Username and Password');
  });

  it('should return Error if Username is not found in the system (Status 401)', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const response = await request(app)
      .post('/api/login')
      .send({
        username: 'notfounduser',
        password: 'ValidPassword123'
      });

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('error', 'Invalid Username or Password');
  });

  it('should return Error if Password is incorrect (Status 401)', async () => {
    const hashedPassword = await bcrypt.hash('DifferentPassword123', 10);
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1, username: testUser, password_hash: hashedPassword }] });

    const response = await request(app)
      .post('/api/login')
      .send({
        username: testUser,
        password: 'ValidPassword123'
      });

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('error', 'Invalid Username or Password');
  });

});
