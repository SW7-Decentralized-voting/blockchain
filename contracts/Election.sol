// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract Election {
    // Election Phases
    enum ElectionPhase { Registration, Voting, Tallying }
    ElectionPhase public phase;

    struct Candidate {
        uint id;
        string name;
        string party;
        uint encryptedVotes; // Placeholder for homomorphic aggregation
    }

    struct Party {
        uint id;
        string name;
        uint encryptedVotes; // Placeholder for homomorphic aggregation
    }

    struct VotingKey {
        bool isValid;
        bool isUsed;
    }

    mapping(uint => Candidate) public candidates;    // To store candidates
    mapping(uint => Party) public parties;           // To store parties
    mapping(bytes32 => VotingKey) public votingKeys; // To store valid voting keys
    uint public totalCandidates;
    uint public totalParties;
    uint public totalUsedKeys;
    
    address public electionOwner;
    string private decryptionKey;
    bool public isKeyPublished;

    // Events for vote submission and phase changes
    event VoteCast(bytes32 key, uint entityId, bool isParty, uint encryptedVote);
    event PhaseChanged(ElectionPhase newPhase);
    event DecryptionKeyPublished(string decryptionKey);

    // Constructor sets the contract owner (who can control election phases)
    constructor() {
        electionOwner = msg.sender;
        phase = ElectionPhase.Registration; // Start in the registration phase
        isKeyPublished = false;
    }

    // Modifier to restrict certain actions to the owner (election controller)
    modifier onlyOwner() {
        require(msg.sender == electionOwner, "Only the election owner can perform this action.");
        _;
    }

    // Modifier to check if the current phase matches the required phase
    modifier inPhase(ElectionPhase requiredPhase) {
        require(phase == requiredPhase, "Invalid phase for this action.");
        _;
    }

    // Function to add candidates to the election
    function addCandidate(string memory _name, string memory _party) public onlyOwner inPhase(ElectionPhase.Registration) {
        candidates[totalCandidates] = Candidate(totalCandidates, _name, _party, 0);
        totalCandidates++;
    }

    function getCandidates() public view returns (Candidate[] memory) {
        Candidate[] memory candidateList = new Candidate[](totalCandidates);
        for (uint i = 0; i < totalCandidates; i++) {
            candidateList[i] = candidates[i];
        }
        return candidateList;
    }

    // Function to add parties to the election
    function addParty(string memory _name) public onlyOwner inPhase(ElectionPhase.Registration) {
        parties[totalParties] = Party(totalParties, _name, 0);
        totalParties++;
    }

    // Function to start the voting phase
    function startVotingPhase() public onlyOwner inPhase(ElectionPhase.Registration) {
        phase = ElectionPhase.Voting;
        emit PhaseChanged(ElectionPhase.Voting);
    }

    function addVotingKey(bytes32 keyHash) public onlyOwner inPhase(ElectionPhase.Registration) {
        votingKeys[keyHash] = VotingKey(true, false);
    }

    function voteWithKey(bytes32 key, uint entityId, bool isParty, uint encryptedVote) public inPhase(ElectionPhase.Voting) {
        require(votingKeys[key].isValid, "Invalid voting key.");
        require(!votingKeys[key].isUsed, "This key has already been used.");

        // Mark the key as used
        votingKeys[key].isUsed = true;
        totalUsedKeys++;

        // Record the vote for either candidate or party (homomorphic aggregation simulated)
        if (isParty) {
            require(entityId < totalParties, "Invalid party ID.");
            parties[entityId].encryptedVotes += encryptedVote;
        } else {
            require(entityId < totalCandidates, "Invalid candidate ID.");
            candidates[entityId].encryptedVotes += encryptedVote;
        }

        emit VoteCast(key, entityId, isParty, encryptedVote);
    }

    // Function to end the voting phase and begin tallying
    function startTallyingPhase() public onlyOwner inPhase(ElectionPhase.Voting) {
        phase = ElectionPhase.Tallying;
        emit PhaseChanged(ElectionPhase.Tallying);
    }

    function uploadDecryptionKey(string memory key) public onlyOwner inPhase(ElectionPhase.Registration) {
        decryptionKey = key;
    }

    function publishDecryptionKey() public onlyOwner inPhase(ElectionPhase.Tallying) {
        isKeyPublished = true; // Mark the key as published
        emit DecryptionKeyPublished(decryptionKey);
    }

    function getDecryptionKey() public view returns (string memory) {
        if (msg.sender == electionOwner) {
            return decryptionKey;  // Owner can access the key at any time
        }
        require(isKeyPublished, "Decryption key has not been published yet.");
        return decryptionKey;  // Public can access it only after publishing
    }

    // Function to get candidate details (for tallying purposes)
    function getCandidate(uint candidateId) public view returns (string memory, string memory, uint) {
        return (candidates[candidateId].name, candidates[candidateId].party, candidates[candidateId].encryptedVotes);
    }

    // Function to get party details (for tallying purposes)
    function getParty(uint partyId) public view returns (string memory, uint) {
        return (parties[partyId].name, parties[partyId].encryptedVotes);
    }

    function getParties() public view returns (Party[] memory) {
        Party[] memory partyList = new Party[](totalParties);
        for (uint i = 0; i < totalParties; i++) {
            partyList[i] = parties[i];
        }
        return partyList;
    }
}