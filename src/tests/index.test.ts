import request from 'supertest';
import {app} from './../index';

describe('Test the root path', () => {
    test('It should response the GET method', async () => {
        await request(app).get('/').expect(200);
    });
})