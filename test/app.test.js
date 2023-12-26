require('dotenv').config();
const request = require('supertest');
const app = require('../app');

// Mock user_routes.js, booking_routes.js, and venue_routes.js
jest.mock('../routes/user_routes', () => jest.fn((req, res, next) => res.send('User Route')));
jest.mock('../routes/booking_routes', () => jest.fn((req, res, next) => res.send('Booking Route')));
jest.mock('../routes/venue_routes', () => jest.fn((req, res, next) => res.send('Venue Route')));

describe('GET /users', () => {
  it('should return "User Route" as response', async () => {
    const response = await request(app).get('/users');
    expect(response.status).toBe(200);
    expect(response.text).toBe('User Route');
  });
});


it('should handle unknown path', async () => {
    const response = await request(app).get('/unknown');
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'path not found' });
  });


  