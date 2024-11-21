import request from 'supertest';
import express from 'express';
import stopContract from '../../utils/stopContract.js';
import startContract from '../../utils/startContract.js';
import { ElectionPhase } from '../../utils/constants.js';

let router;
const baseRoute = '/election';

const app = express();
app.use(express.json());
app.use(baseRoute, async (req, res, next) => (await router)(req, res, next));

const server = app.listen(0);

beforeAll(async () => {
    router = (await import('../../routes/electionRoutes.js')).default;
});

beforeEach(async () => {
    await stopContract();
});

afterAll(() => {
    server.close();
});

describe('Election Routes', () => {
    describe('POST /election/start', () => {
        test('It should respond with 400 when no election contract is deployed and no candidates or parties', async () => {
            const body = {};
            const response = await request(server).post(baseRoute + '/start').send(body);
            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({ error: 'Candidates and parties are required' });
        });

        test('It should respond with 200 when no election contract is deployed with candidates and parties', async () => {
            const body = {
                'candidates': [
                    { 'name': 'Johan', 'party': 'democrats' }
                ],
                'parties': [
                    {'name': 'democrats' }
                ],
                'publicKey': 'key'
            };
            const response = await request(server).post(baseRoute + '/start').send(body);
            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({ message: 'Election started successfully'});
        });

        test('It should respond with 400 when an election contract is already deployed', async () => {
            await startContract();
            const body = {
                'candidates': [
                    {'name': 'Johan', 'party': 'democrats' }
                ],
                'parties': [
                    {'name': 'democrats' }
                ]
            };
            const response = await request(server).post(baseRoute + '/start').send(body);
            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({ error: 'Election has already started' });
        });
    });

    describe('POST /election/advance-phase', () => {
        test('It should respond with 400 when no election contract is deployed', async () => {
            const response = await request(server).post(baseRoute + '/advance-phase');
            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({ error: 'Election has not started' });
        });

        test('It should respond with 200 when an election contract is deployed and in registration phase', async () => {
            const body = {
                'candidates': [
                    {'name': 'Johan', 'party': 'democrats' }
                ],
                'parties': [
                    { 'name': 'democrats' }
                ]
            };
            await request(server).post(baseRoute + '/start').send(body);
            const response = await request(server).post(baseRoute + '/advance-phase');
            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({ message: 'Election phase advanced to voting phase', transactionHash: expect.any(String) });
        });

        test('It should respond with 200 when an election contract is deployed and in voting phase', async () => {
            const body = {
                'candidates': [
                    {'name': 'Johan', 'party': 'democrats' }
                ],
                'parties': [
                    { 'name': 'democrats' }
                ]
            };
            await request(server).post(baseRoute + '/start').send(body);
            await request(server).post(baseRoute + '/advance-phase');
            const response = await request(server).post(baseRoute + '/advance-phase');
            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({ message: 'Election phase advanced to tallying phase', transactionHash: expect.any(String) });
        });

        test('It should respond with 400 when an election contract is deployed and in tallying phase', async () => {
            const body = {
                'candidates': [
                    {'name': 'Johan', 'party': 'democrats' }
                ],
                'parties': [
                    { 'name': 'democrats' }
                ]
            };
            await request(server).post(baseRoute + '/start').send(body);
            await request(server).post(baseRoute + '/advance-phase');
            await request(server).post(baseRoute + '/advance-phase');
            const response = await request(server).post(baseRoute + '/advance-phase');
            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({ error: 'Election has already ended' });
        });
    });

    describe('GET /election/current-phase', () => {
        test('It should respond with 400 when no election contract is deployed', async () => {
            const response = await request(server).get(baseRoute + '/current-phase');
            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({ error: 'Election has not started' });
        });

        test('It should respond with 200 when an election contract is deployed', async () => {
            await startContract();
            const response = await request(server).get(baseRoute + '/current-phase');
            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({ currentPhase: ElectionPhase.Registration.toString() });
        });
    });
});