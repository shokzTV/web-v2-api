import request from 'supertest';
import {app} from './../index';

afterAll(async () => {
	await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
});

describe('Test the root path', () => {
    test('It should response the GET method', async (done) => {
        await request(app).get('/').expect(200);

        done();
    });
})