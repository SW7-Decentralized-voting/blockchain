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
    }

    struct Party {
        uint id;
        string name;
    }

    struct VotingKey {
        bool isValid;
        bool isUsed;
    }

    mapping(uint => Candidate) public candidates;    // To store candidates
    mapping(uint => Party) public parties;           // To store parties
    
    uint public totalCandidates;
    uint public totalParties;
    
    
    address public electionOwner;
    string public encryptionKey;
    string public decryptionKey;

    // Events for vote submission and phase changes
    event VoteCast(bytes encryptedVote);
    event PhaseChanged(ElectionPhase newPhase);


    bytes[] public encryptedVotes;

    // Constructor sets the contract owner (who can control election phases)
    constructor() {
        electionOwner = msg.sender;
        phase = ElectionPhase.Registration; // Start in the registration phase
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
        candidates[totalCandidates] = Candidate(totalCandidates, _name, _party);
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
        parties[totalParties] = Party(totalParties, _name);
        totalParties++;
    }

    // Function to start the voting phase
    function startVotingPhase() public onlyOwner inPhase(ElectionPhase.Registration) {
        phase = ElectionPhase.Voting;
        emit PhaseChanged(ElectionPhase.Voting);
    }

    function castVote(bytes memory _encryptedVote) public inPhase(ElectionPhase.Voting) {
    encryptedVotes.push(_encryptedVote);
    emit VoteCast(_encryptedVote);
    }

    // Function to end the voting phase and begin tallying
    function startTallyingPhase() public onlyOwner inPhase(ElectionPhase.Voting) {
        phase = ElectionPhase.Tallying;
        emit PhaseChanged(ElectionPhase.Tallying);
    }

    function uploadEncryptionKey(string memory key) public onlyOwner inPhase(ElectionPhase.Registration) {
        encryptionKey = key;
    }

    function uploadDecryptionKey(string memory key) public onlyOwner inPhase(ElectionPhase.Tallying) {
        decryptionKey = key;
    }

    // Function to get candidate details (for tallying purposes)
    function getCandidate(uint candidateId) public view returns (string memory, string memory) {
        return (candidates[candidateId].name, candidates[candidateId].party);
    }

    // Function to get party details (for tallying purposes)
    function getParty(uint partyId) public view returns (string memory) {
        return (parties[partyId].name);
    }

    function getParties() public view returns (Party[] memory) {
        Party[] memory partyList = new Party[](totalParties);
        for (uint i = 0; i < totalParties; i++) {
            partyList[i] = parties[i];
        }
        return partyList;
    }

    function getEncryptedVotes() public view returns (bytes[] memory) {
        return encryptedVotes;
    }
}