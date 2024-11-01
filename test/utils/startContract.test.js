import startContract from '../../utils/startContract.js';
import stopContract from '../../utils/stopContract.js';
import { getElection } from '../../utils/electionManager.js';

beforeEach(async () => {
    await stopContract();
}
);

describe('startContract', () => {
    test('It should set the election instance when no contract is deployed', async () => {
        await startContract();
        const election = getElection();
        expect(election).toBeDefined();
    });

    test('It should throw an error when a contract is already deployed', async () => {
        await startContract();
        await expect(startContract()).rejects.toThrow('Election has already started');
    });
});