import request from 'supertest';
import 'dotenv/config';

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

export function api() {
  return request(baseUrl);
}