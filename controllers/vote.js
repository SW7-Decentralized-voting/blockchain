import { getElection } from '../utils/electionManager.js';
import { ElectionPhase } from '../utils/constants.js';

async function vote(req, res, next) {
    const election = getElection();

    if (election === null) {
        return res.status(400).json({ error: 'Election has not started' });
    }

    const { encryptedVote } = req.body;

    try {
        const currentPhase = await election.phase();
        if (currentPhase !== ElectionPhase.Voting) {
            return res.status(400).json({ error: 'Election is not in the voting phase' });
        }

        const tx = await election.castVote(encryptedVote);
        await tx.wait();

        res.json({
            message: 'Vote cast successfully',
            transactionHash: tx.hash
        });
    } catch (error) {
        next(error);
    }
}

async function getEncryptionKey(req, res, next) {
    if (getElection() === null) {
        return res.status(400).json({ error: 'Election has not started' });
    }

    const election = getElection();
    try {
        const encryptionKey = await election.encryptionKey();
        res.json(encryptionKey);
    } catch (error) {
        next(error);
    }
}

export { vote, getEncryptionKey };