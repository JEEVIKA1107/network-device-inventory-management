const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');

describe('NetTrack DFA - Backend REST API Test Suite', () => {
  let authToken;

  beforeAll(async () => {
    // Authenticate with seeded admin account
    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@nettrack.edu',
      password: 'Password@123'
    });
    authToken = res.body.token;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test('GET /api/health should return 200 and online status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('online');
    expect(res.body.service).toBe('NetTrack DFA API');
  });

  test('POST /api/validation/ipv4 should validate valid IPv4 address', async () => {
    const res = await request(app)
      .post('/api/validation/ipv4')
      .send({ ipAddress: '192.168.1.1' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.validation.isValid).toBe(true);
    expect(res.body.validation.regexMatch).toBe(true);
    expect(res.body.validation.dfaAccepted).toBe(true);
  });

  test('POST /api/validation/ipv4 should reject out-of-range address (256.1.1.1)', async () => {
    const res = await request(app)
      .post('/api/validation/ipv4')
      .send({ ipAddress: '256.1.1.1' });

    expect(res.statusCode).toBe(200);
    expect(res.body.validation.isValid).toBe(false);
    expect(res.body.validation.errorReason).toContain('exceeds maximum 255');
  });

  test('POST /api/validation/dfa/simulate should return step-by-step trace', async () => {
    const res = await request(app)
      .post('/api/validation/dfa/simulate')
      .send({ ipAddress: '10.0.0.1' });

    expect(res.statusCode).toBe(200);
    expect(res.body.simulation.trace).toBeDefined();
    expect(res.body.simulation.trace.steps.length).toBe(8);
  });

  test('GET /api/devices should return seeded devices list', async () => {
    const res = await request(app)
      .get('/api/devices')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.devices.length).toBeGreaterThanOrEqual(7);
  });

  test('POST /api/devices should reject duplicate IP in the same network scope', async () => {
    const res = await request(app)
      .post('/api/devices')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        deviceName: 'Duplicate Router Test',
        deviceType: 'Router',
        ipAddress: '192.168.1.1', // Already assigned to Router 01
        department: 'IT',
        building: 'Main',
        laboratory: 'Lab 1'
      });

    expect(res.statusCode).toBe(409);
    expect(res.body.isDuplicate).toBe(true);
    expect(res.body.message).toContain('Duplicate IP Address detected');
  });

  test('GET /api/reports/dashboard should return real MongoDB counts and aggregates', async () => {
    const res = await request(app)
      .get('/api/reports/dashboard')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.summary.totalDevices).toBeGreaterThanOrEqual(7);
    expect(res.body.summary.routers).toBeGreaterThanOrEqual(1);
    expect(res.body.summary.switches).toBeGreaterThanOrEqual(1);
    expect(res.body.charts.categoryDistribution.labels).toBeDefined();
  });
});
