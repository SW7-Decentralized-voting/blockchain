import { expect } from 'chai';
import { ElectionPhase } from '../../utils/constants.js';
import pkg from 'hardhat';
const { ethers } = pkg;

describe('Election Contract', function () {
    let ElectionContract;
    let election;
    let owner, _addr1;

    beforeEach(async function () {
        // Get the contract and deploy it
        ElectionContract = await ethers.getContractFactory('Election');
        [owner, _addr1] = await ethers.getSigners();
        election = await ElectionContract.deploy();
    });

    it('Should set the right owner', async function () {
        expect(await election.electionOwner()).to.equal(owner.address);
    });

    it('Should start in the registration phase', async function () {
        expect(await election.phase()).to.equal(ElectionPhase.Registration);
    });

    it('Should not allow non-owners to add a candidate', async function () {
        await expect(
            election.connect(_addr1).addCandidate('0x0', 'Alice', 'PartyA')
        ).to.be.revertedWith('Only the election owner can perform this action.');
    }
    );

    it('Should add a candidate', async function () {
        await election.addCandidate('0x0', 'Alice', 'PartyA');
        const candidate = await election.candidates(0);
        expect(candidate.objectId).to.equal('0x0');
        expect(candidate.name).to.equal('Alice');
        expect(candidate.party).to.equal('PartyA');
    });

    it('Should add a party', async function () {
        await election.addParty('0x0', 'PartyA');
        const party = await election.parties(0);
        expect(party.objectId).to.equal('0x0');
        expect(party.name).to.equal('PartyA');
    });

    it('Should transition to voting phase', async function () {
        await election.startVotingPhase();
        expect(await election.phase()).to.equal(ElectionPhase.Voting);
    });

    it('Should transition to tallying phase', async function () {
        await election.startVotingPhase();
        await election.startTallyingPhase();
        expect(await election.phase()).to.equal(ElectionPhase.Tallying);
    });

    it('Should allow uploading the encryption key in the registration phase', async function () {
        await election.uploadEncryptionKey('key');
        expect(await election.encryptionKey()).to.equal('key');
    });

    it('Should allow uploading the decryption key in the tallying phase', async function () {
        await election.startVotingPhase();
        await election.startTallyingPhase();
        await election.uploadDecryptionKey('key');
        expect(await election.decryptionKey()).to.equal('key');
    }
    );

    it('Should not allow uploading the encryption key if not in registration phase', async function () {
        await election.startVotingPhase();
        await expect(
            election.uploadEncryptionKey('key')
        ).to.be.revertedWith('Invalid phase for this action.');
    }
    );

    it('Should not allow uploading the decryption key if not in tallying phase', async function () {
        await expect(
            election.uploadDecryptionKey('key')
        ).to.be.revertedWith('Invalid phase for this action.');
    }
    );

    it('Should allow voting', async function () {
        await election.startVotingPhase();
        await election.castVote('0x1234567890abcdef');
        const vote = await election.getEncryptedVotes();
        expect(vote[0]).to.equal('0x1234567890abcdef');
    }
    );
});