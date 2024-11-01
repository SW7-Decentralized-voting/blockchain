import { getElection } from '../utils/electionManager.js';
import convertBigIntToString from '../utils/convertBigIntToString.js';
import { ElectionPhase } from '../utils/constants.js';

async function getCandidates(req, res, next) {
    const election = getElection();
    if (election === null) {
        return res.status(400).json({ error: 'Election has not started' });
    }
    
    try {
        const candidates = await election.getCandidates();
        const candidatesWithStrings = convertBigIntToString(candidates);
        res.json(candidatesWithStrings);
    } catch (error) {
        next(error);
    }
}

async function publishCandidate(name, party) {
    const election = getElection();
    if (election === null) {
        throw new Error('Election has not started');
    }

    if (!name || !party) {
        throw new Error('Candidate name and party are required');
    }

    try {
        const currentPhase = await election.phase();
        if (currentPhase !== ElectionPhase.Registration) {
            throw new Error('Candidates can only be added during the registration phase');
        }

        const tx = await election.addCandidate(name, party);
        await tx.wait();

        return tx.hash;
    } catch (error) {
        console.error(error);
    }
}

export { getCandidates, publishCandidate };