async function generateKeyPair() {
    return null;
}

function encryptVote(vote, publicKey) {
    // TODO update to new encryption library
    return publicKey.encrypt(vote);
}

export { generateKeyPair, encryptVote };