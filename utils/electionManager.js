let electionInstance = null;

const getElection = () => electionInstance;

const setElection = (election) => {
  if (electionInstance !== null) {
    throw new Error('Election has already started');
  }
  electionInstance = election;
};

export { getElection, setElection };