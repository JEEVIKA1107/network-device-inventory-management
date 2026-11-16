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

  describe('Role-Based Access Control (RBAC) & Permission Suite', () => {
    let adminToken;
    let staffToken;
    let viewerToken;
    let testDeviceId;

    beforeAll(async () => {
      // Login Admin
      const adminRes = await request(app).post('/api/auth/login').send({
        email: 'admin@nettrack.edu',
        password: 'Password@123'
      });
      adminToken = adminRes.body.token;

      // Login Staff
      const staffRes = await request(app).post('/api/auth/login').send({
        email: 'staff@nettrack.edu',
        password: 'Password@123'
      });
      staffToken = staffRes.body.token;

      // Login Viewer
      const viewerRes = await request(app).post('/api/auth/login').send({
        email: 'viewer@nettrack.edu',
        password: 'Password@123'
      });
      viewerToken = viewerRes.body.token;
    });

    test('Viewer CAN successfully register / add a new device (POST /api/devices)', async () => {
      const res = await request(app)
        .post('/api/devices')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({
          deviceName: 'Viewer Registered Lab Workstation',
          deviceType: 'Computer',
          ipAddress: '192.168.1.188',
          macAddress: 'AA:BB:CC:DD:EE:88',
          department: 'Computer Science',
          building: 'Lab Complex',
          laboratory: 'Lab 3',
          location: 'Row 3 - PC 8',
          connectionStatus: 'Online'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.device.deviceName).toBe('Viewer Registered Lab Workstation');
      testDeviceId = res.body.device._id;
    });

    test('Viewer CANNOT edit an existing device (PUT /api/devices/:id) -> 403 Forbidden', async () => {
      const res = await request(app)
        .put(`/api/devices/${testDeviceId}`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({
          deviceName: 'Unauthorized Viewer Update Attempt'
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('not authorized');
    });

    test('Viewer CANNOT delete a device (DELETE /api/devices/:id) -> 403 Forbidden', async () => {
      const res = await request(app)
        .delete(`/api/devices/${testDeviceId}`)
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('not authorized');
    });

    test('Viewer CANNOT access User Management (GET /api/users) -> 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });

    test('Viewer CANNOT create network scopes (POST /api/scopes) -> 403 Forbidden', async () => {
      const res = await request(app)
        .post('/api/scopes')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({
          name: 'Unauthorized Viewer Scope',
          cidr: '172.16.100.0/24'
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });

    test('Staff CAN update a device (PUT /api/devices/:id) -> 200 OK', async () => {
      const res = await request(app)
        .put(`/api/devices/${testDeviceId}`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          deviceName: 'Staff Updated Lab Workstation'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.device.deviceName).toBe('Staff Updated Lab Workstation');
    });

    test('Staff CANNOT delete a device (DELETE /api/devices/:id) -> 403 Forbidden', async () => {
      const res = await request(app)
        .delete(`/api/devices/${testDeviceId}`)
        .set('Authorization', `Bearer ${staffToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('not authorized');
    });

    test('Staff CANNOT access User Management (GET /api/users) -> 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${staffToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });

    test('Admin CAN delete a device (DELETE /api/devices/:id) -> 200 OK', async () => {
      const res = await request(app)
        .delete(`/api/devices/${testDeviceId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
