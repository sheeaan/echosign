import { loadOrCreateKeypair } from '../packages/solana/src/wallet.js';

const keypair = loadOrCreateKeypair();
console.log('Wallet public key:', keypair.publicKey.toBase58());
console.log('Fund it at: https://faucet.solana.com');
