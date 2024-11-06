import request from 'supertest';
import express from 'express';
import stopContract from '../../utils/stopContract.js';
import startContract from '../../utils/startContract.js';
import { getElection } from '../../utils/electionManager.js';


let router;
const baseRoute = '/tally';

const app = express();
app.use(express.json());
app.use(baseRoute, async (req, res, next) => (await router)(req, res, next));

const server = app.listen(0);

beforeAll(async () => {
    router = (await import('../../routes/tallyRoutes.js')).default;
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
        await startContract();
        await getElection().startVotingPhase();
        await getElection().startTallyingPhase();
        const response = await request(app)
            .get(`${baseRoute}/encrypted-votes`);

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual([]);
    });
}
);