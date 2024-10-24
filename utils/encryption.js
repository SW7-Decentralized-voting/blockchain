import * as paillierBigint from 'paillier-bigint';

async function generateKeyPair() {
    return await paillierBigint.generateRandomKeys(3072);
}

function encryptVote(vote, publicKey) {
    return publicKey.encrypt(vote);
}

export { generateKeyPair, encryptVote };