import request from 'supertest';
import express from 'express';
import stopContract from '../../utils/stopContract.js';
import startContract from '../../utils/startContract.js';
import { getElection } from '../../utils/electionManager.js';
import electionRouter from '../../routes/electionRoutes.js';
import * as paillierBigint from 'paillier-bigint';
import { expect, jest } from '@jest/globals';

let router, voteRouter;
const baseRoute = '/tally';

const app = express();
app.use(express.json());
app.use(baseRoute, async (req, res, next) => (await router)(req, res, next));
app.use('/election', electionRouter);
app.use('/vote', async (req, res, next) => (await voteRouter)(req, res, next));

const server = app.listen(0);

jest.unstable_mockModule('../../middleware/auth.js', () => {
    return {
        default: jest.fn((req, res, next) => next()),
    };
});

beforeAll(async () => {
    router = (await import('../../routes/tallyRoutes.js')).default;
    voteRouter = (await import('../../routes/voteRoutes.js')).default;
});

beforeEach(async () => {
    await stopContract();
});

afterAll(() => {
    server.close();
});

describe('POST /upload-key', () => {
    it('Should return an error if the election has not started', async () => {
        const response = await request(app)
            .post(`${baseRoute}/upload-key`)
            .send({ decryptionKey: 'key' });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('Election has not started');
    });

    it('Should return an error if the election is not in the tallying phase', async () => {
        await startContract();

        const response = await request(app)
            .post(`${baseRoute}/upload-key`)
            .send({ decryptionKey: 'key' });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('Election is not in the tallying phase');
    });

    it('Should return an error if the decryption key is not provided', async () => {
        await startContract();
        await getElection().startVotingPhase();
        await getElection().startTallyingPhase();
        const response = await request(app)
            .post(`${baseRoute}/upload-key`)
            .send({});

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('decryptionKey is required');
    });

    it('Should upload the decryption key', async () => {
        await startContract();
        await getElection().startVotingPhase();
        await getElection().startTallyingPhase();
        const response = await request(app)
            .post(`${baseRoute}/upload-key`)
            .send({ decryptionKey: 'key' });

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Key uploaded successfully');
        expect(response.body.transactionHash).toBeDefined();
    });
}
);

describe('GET /encrypted-votes', () => {
    it('Should return an error if the election has not started', async () => {
        const response = await request(app)
            .get(`${baseRoute}/encrypted-votes`);

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('Election has not started');
    });

    it('Should return an error if the election is not in the tallying phase', async () => {
        await startContract();
        const response = await request(app)
            .get(`${baseRoute}/encrypted-votes`);

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('Election is not in the tallying phase');
    });

    it('Should return the encrypted votes', async () => {
        const { publicKey, _privateKey } = await paillierBigint.generateRandomKeys(3072);

        const publicKeyString = JSON.stringify({
            n: publicKey.n.toString(),
            g: publicKey.g.toString()
        });

        const body = {
            'candidates': [
                {'voteId': '0', 'name': 'Dwayne "The Rock" Johnson', 'party': 'democrats' },
                {'voteId': '1', 'name': 'Arnold Schwarzenegger', 'party': 'republicans' },
                {'voteId': '2', 'name': 'Tom Hanks', 'party': 'democrats' }
            ],
            'parties': [
                {'voteId': '3', 'name': 'democrats' }
            ],
            'publicKey': publicKeyString
        };

        await request(app).post('/election/start').send(body);
        await getElection().startVotingPhase();
        await request(app).post('/vote').send({ voteId: 0 });
        await getElection().startTallyingPhase();
        const response = await request(app)
            .get(`${baseRoute}/encrypted-votes`);

        expect(response.statusCode).toBe(200);
        // expect array of arrays of strings
        expect(response.body).toEqual([
            [expect.any(String), expect.any(String), expect.any(String), expect.any(String)]
        ]);
    });
}
);

describe('GET /tally', () => {
    const privateKey = 'key';
    it('Should return an error if the election has not started', async () => {
        const response = await request(app)
            .get(baseRoute)
            .send({ privateKey });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('Election has not started');
    });

    it('Should return an error if the election is not in the tallying phase', async () => {
        await startContract();
        const response = await request(app)
            .get(`${baseRoute}/`)
            .send({ privateKey });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('Election is not in the tallying phase');
    });

    it('Should return the tally (empty)', async () => {
        const { privateKey } = await paillierBigint.generateRandomKeys(3072);

        const privateKeyString = JSON.stringify({
            lambda: privateKey.lambda.toString(),
            mu: privateKey.mu.toString(),
            publicKey: {
                n: privateKey.publicKey.n.toString(),
                g: privateKey.publicKey.g.toString()
            }
        });

        await startContract();
        await getElection().startVotingPhase();
        await getElection().startTallyingPhase();
        const response = await request(app)
            .get(`${baseRoute}/`)
            .send({ privateKey: privateKeyString });

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({});
    });

    it('Should return the tally', async () => {
        const { publicKey, privateKey } = await paillierBigint.generateRandomKeys(3072);

        const privateKeyString = JSON.stringify({
            lambda: privateKey.lambda.toString(),
            mu: privateKey.mu.toString(),
            publicKey: {
                n: privateKey.publicKey.n.toString(),
                g: privateKey.publicKey.g.toString()
            }
        });

        const publicKeyString = JSON.stringify({
            n: publicKey.n.toString(),
            g: publicKey.g.toString()
        });

        const body = {
            'candidates': [
                {'voteId': '0', 'name': 'Dwayne "The Rock" Johnson', 'party': 'democrats' },
                {'voteId': '1', 'name': 'Arnold Schwarzenegger', 'party': 'republicans' },
                {'voteId': '2', 'name': 'Tom Hanks', 'party': 'democrats' }
            ],
            'parties': [
                {'voteId': '3', 'name': 'democrats' }
            ],
            'publicKey': publicKeyString
        };
        
        await request(app).post('/election/start').send(body);
        await getElection().startVotingPhase();
        await request(app).post('/vote').send({ voteId: 0 });
        await request(app).post('/vote').send({ voteId: 1 });
        await request(app).post('/vote').send({ voteId: 0 });
        await getElection().startTallyingPhase();
        const response = await request(app)
            .get(`${baseRoute}/`)
            .send({ privateKey: privateKeyString });

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ tally: ['2', '1', '0', '0'] });
    });
});