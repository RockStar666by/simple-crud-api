import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { createServer } from 'http';
import { db } from './database/database';
import { AppServer } from './app';
import { IUser } from './utils/interfaces';

const app = new AppServer(db);

describe('Test crud methods', () => {
  const serverTest = createServer((request, response) => app.onRequest(request, response));
  let id = uuidv4();
  let createdUser: IUser = null;

  afterAll(() => serverTest.close());
  test('should respond with a 200 status code and empty array', async () => {
    const response = await request(serverTest).get('/api/users');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });
  test('should respond with a 404 status code', async () => {
    const response = await request(serverTest).get(`/api/users/${id}`);
    expect(response.status).toBe(404);
  });
  test('should return newly created record', async () => {
    const newUser = {
      username: 'Artem',
      age: 27,
      hobbies: ['cars']
    };
    const response = await request(serverTest).post('/api/users').send(newUser);
    id = response.body.id;
    const addedUser = { ...newUser, id: id };
    createdUser = addedUser;
    expect(response.status).toBe(201);
    expect(response.body).toEqual(createdUser);
  });
  test('should respond with a 200 status code and one record', async () => {
    const response = await request(serverTest).get(`/api/users/${id}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(createdUser);
  });
  test('should respond with a 200 status code and updated record', async () => {
    const updateUser: any = {
      username: 'Annie',
      age: 32
    };
    const response = await request(serverTest).put(`/api/users/${id}`).send(updateUser);
    const updatedUser = { ...createdUser, ...updateUser };
    expect(response.status).toBe(200);
    expect(response.body).toEqual(updatedUser);
  });
  test('should respond with a 204 status code', async () => {
    const response = await request(serverTest).delete(`/api/users/${id}`);
    expect(response.status).toBe(204);
  });
  test('should respond with a 200 status code and empty array', async () => {
    const response = await request(serverTest).get('/api/users');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });
  test('should respond with a 404 status code', async () => {
    const response = await request(serverTest).get(`/api/users/${id}`);
    expect(response.status).toBe(404);
  });
});
