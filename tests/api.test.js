const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Crime = require('../models/Crime');

describe('API smoke', () => {
  test('GET / responds ok', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
  });
});

describe('CRUD routes', () => {
  let createdId;

  test('POST /api/crimes creates a crime', async () => {
    const payload = {
      OFFENSE: 'TEST_OFFENSE',
      REPORT_DAT: '2025-01-15T12:34:56.000Z',
      SHIFT: 'DAY',
      METHOD: 'OTHERS',
      WARD: '2',
      PSA: '201',
      NEIGHBORHOOD_CLUSTER: 'Cluster TEST'
    };
    const res = await request(app).post('/api/crimes').send(payload);
    expect(res.statusCode).toBe(201);
    expect(res.body.ok).toBe(true);
    createdId = res.body.doc._id;
  });

  test('GET /api/crimes/:id fetches a specific crime', async () => {
    const res = await request(app).get(`/api/crimes/${createdId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.doc._id).toBe(createdId);
  });

  test('PUT /api/crimes/:id updates a crime', async () => {
    const res = await request(app).put(`/api/crimes/${createdId}`).send({ SHIFT: 'EVENING' });
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.doc.SHIFT).toBe('EVENING');
  });

  test('DELETE /api/crimes/:id deletes a crime', async () => {
    const res = await request(app).delete(`/api/crimes/${createdId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});

describe('Question endpoints (all 8)', () => {
  test('Q1: /api/questions/top5-offense-2025', async () => {
    const res = await request(app).get('/api/questions/top5-offense-2025');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.answer)).toBe(true);
  });

  test('Q2: /api/questions/most-common-weekday', async () => {
    const res = await request(app).get('/api/questions/most-common-weekday');
    expect(res.statusCode).toBe(200);
    // answer can be null if no data, else has weekday/count
    if (res.body.answer) {
      expect(res.body.answer).toHaveProperty('weekday');
      expect(res.body.answer).toHaveProperty('count');
    }
  });

  test('Q3: /api/questions/busiest-hour', async () => {
    const res = await request(app).get('/api/questions/busiest-hour');
    expect(res.statusCode).toBe(200);
    if (res.body.answer) {
      expect(res.body.answer).toHaveProperty('hour');
      expect(res.body.answer).toHaveProperty('count');
    }
  });

  test('Q4: /api/questions/top-ward', async () => {
    const res = await request(app).get('/api/questions/top-ward');
    expect(res.statusCode).toBe(200);
    if (res.body.answer) {
      expect(res.body.answer).toHaveProperty('WARD');
      expect(res.body.answer).toHaveProperty('count');
    }
  });

  test('Q5: /api/questions/top-psa', async () => {
    const res = await request(app).get('/api/questions/top-psa');
    expect(res.statusCode).toBe(200);
    if (res.body.answer) {
      expect(res.body.answer).toHaveProperty('PSA');
      expect(res.body.answer).toHaveProperty('count');
    }
  });

  test('Q6: /api/questions/method-fractions', async () => {
    const res = await request(app).get('/api/questions/method-fractions');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.answer)).toBe(true);
  });

  test('Q7: /api/questions/shift-comparison', async () => {
    const res = await request(app).get('/api/questions/shift-comparison');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.answer)).toBe(true);
  });

  test('Q8: /api/questions/top-month', async () => {
    const res = await request(app).get('/api/questions/top-month');
    expect(res.statusCode).toBe(200);
    if (res.body.answer) {
      expect(res.body.answer).toHaveProperty('month');
      expect(res.body.answer).toHaveProperty('count');
    }
  });
});

afterAll(async () => {
  await mongoose.connection.close(true).catch(() => {});
});
