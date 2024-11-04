import { setElection, getElection } from '../../utils/electionManager';

beforeEach(() => {
    setElection(null);
});

describe('electionManager', () => {
    test('setElection sets election', () => {
        const election = 'something';

        setElection(election);

        expect(getElection()).toEqual(election);
    });

    test('setElection throws error if election has already started', () => {
        const election = 'something';

        setElection(election);

        expect(() => setElection(election)).toThrow('Election has already started');
    });
});