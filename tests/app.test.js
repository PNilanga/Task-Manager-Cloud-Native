const request = require('supertest');
const app = require('../src/app');

describe('Task API', () => {
  test('GET /health returns healthy status', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  test('POST /api/tasks creates a task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'Test task', description: 'A test' });
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('Test task');
    expect(res.body.id).toBeDefined();
  });

  test('GET /api/tasks returns all tasks', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('POST /api/tasks without title returns 400', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ description: 'No title' });
    expect(res.statusCode).toBe(400);
  });
});
