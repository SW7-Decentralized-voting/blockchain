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
        expect(await election.phase()).to.equal(0); // Registration phase
    });

    it('Should add a candidate', async function () {
        await election.addCandidate('Alice', 'PartyA');
        const candidate = await election.candidates(0);
        expect(candidate.name).to.equal('Alice');
        expect(candidate.party).to.equal('PartyA');
    });

    it('Should add a party', async function () {
        await election.addParty('PartyA');
        const party = await election.parties(0);
        expect(party.name).to.equal('PartyA');
    });

    it('Should transition to voting phase', async function () {
        await election.startVotingPhase();
        expect(await election.phase()).to.equal(ElectionPhase.Voting); // Voting phase
    });

    it('Should transition to tallying phase', async function () {
        await election.startVotingPhase();
        await election.startTallyingPhase();
        expect(await election.phase()).to.equal(ElectionPhase.Tallying); // Tallying phase
    });

    it('Should allow uploading the encryption key in the registration phase', async function () {
        await election.uploadEncryptionKey('key');
        expect(await election.encryptionKey()).to.equal('key');
    });

    it('Should allow uploading the decryption key in the registration phase', async function () {
        await election.uploadDecryptionKey('key');
        // TODO Add a way for admins to access the decryption key before it is published
    }
    );

    it('Should not allow uploading the encryption key if not in registration phase', async function () {
        await election.startVotingPhase();
        await expect(
            election.uploadEncryptionKey('key')
        ).to.be.revertedWith('Invalid phase for this action.');
    }
    );

    it('Should not allow uploading the decryption key if not in registration phase', async function () {
        await election.startVotingPhase();
        await expect(
            election.uploadDecryptionKey('key')
        ).to.be.revertedWith('Invalid phase for this action.');
    }
    );

    it('Should not allow publishing the decryption key if not in tallying phase', async function () {
        await expect(
            election.publishDecryptionKey()
        ).to.be.revertedWith('Invalid phase for this action.');
    });

    it('Should not allow publishing the decryption key if it has not been uploaded yet', async function () {
        await election.startVotingPhase();
        await election.startTallyingPhase();
        await expect(election.publishDecryptionKey()).to.be.revertedWith('Decryption key has not been uploaded yet.');
    }
    );
});