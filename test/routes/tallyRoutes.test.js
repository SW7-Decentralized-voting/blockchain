import request from 'supertest';
import express from 'express';
import stopContract from '../../utils/stopContract.js';
import startContract from '../../utils/startContract.js';
import { getElection } from '../../utils/electionManager.js';
import { vote } from '../../controllers/vote.js';
import electionRouter from '../../routes/electionRoutes.js';
import { generateKeyPair } from 'crypto';

let router;
const baseRoute = '/tally';

const app = express();
app.use(express.json());
app.use(baseRoute, async (req, res, next) => (await router)(req, res, next));
app.use('/election', electionRouter);

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

describe('GET /tally', () => {
    const privateKey = "key";
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
        await startContract();
        await getElection().startVotingPhase();
        await getElection().startTallyingPhase();
        const response = await request(app)
            .get(`${baseRoute}/`)
            .send({ privateKey });

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({});
    });

    it('Should return the tally', async () => {
        const keypair = await new Promise((resolve, reject) => {
            generateKeyPair('rsa', {
                modulusLength: 2048,  // Length of the key in bits
                publicKeyEncoding: {
                    type: 'spki',       // Recommended to be 'spki' by the Node.js docs
                    format: 'pem'       // Format of the key
                },
                privateKeyEncoding: {
                    type: 'pkcs8',      // Recommended to be 'pkcs8' by the Node.js docs
                    format: 'pem'       // Format of the key
                }
            }, (err, publicKey, privateKey) => {
                if (err) {
                    reject(err);
                } else {
                    resolve({ publicKey, privateKey });
                }
            });
        });
        const body = {
            'candidates': [
                { '_id': '0x0', 'name': 'Johan', 'party': 'democrats' }
            ],
            'parties': [
                { '_id': '0x1','name': 'democrats' }
            ],
            'publicKey': keypair.publicKey
        };
        await request(app).post('/election/start').send(body);
        await getElection().startVotingPhase();
        await vote({ body: { id: '0x0' } }, { status: () => ({json: () => {}})});
        await getElection().startTallyingPhase();
        const response = await request(app)
            .get(`${baseRoute}/`)
            .send({ privateKey: keypair.privateKey });

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            '0x0': 1
        });
    });
});