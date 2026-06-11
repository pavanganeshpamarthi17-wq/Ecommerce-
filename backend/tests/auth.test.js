const request = require('supertest');
const mongoose = require('mongoose');

// We use a mock to avoid real DB connections in unit tests
jest.mock('../config/db');
jest.mock('../utils/sendEmail', () => jest.fn().mockResolvedValue(true));

let app;
beforeAll(() => {
  process.env.JWT_SECRET = 'test_secret';
  process.env.JWT_REFRESH_SECRET = 'test_refresh_secret';
  process.env.JWT_EXPIRE = '15m';
  process.env.JWT_REFRESH_EXPIRE = '7d';
  process.env.NODE_ENV = 'test';
  app = require('../server');
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('should return 400 when email is missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', password: 'Test1234!' });
      expect(res.status).toBe(400);
    });

    it('should return 400 when password is too weak', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email: 'test@test.com', password: 'weak' });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should return 400 when fields are missing', async () => {
      const res = await request(app).post('/api/auth/login').send({});
      expect(res.status).toBe(400);
    });
  });

  describe('GET /health', () => {
    it('should return 200 for health check', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('OK');
    });
  });
});
