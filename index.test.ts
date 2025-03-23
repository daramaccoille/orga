import request from 'supertest';
import express from 'express';
import * as path from 'path';

// Import the app instance from your main file
const app = express();
const port = parseInt(process.env.PORT || '8080', 10);

app.use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/api', (req, res) => {
  res.json({ "msg": "Hello world" });
});

// describe block for grouping tests
describe('API Tests', () => {
  // it block for individual test case
  it('should return a JSON message on /api', async () => {
    const response = await request(app).get('/api');
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe('Hello world');
  });
});