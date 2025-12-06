
import { onRequest } from "firebase-functions/v2/https";
import { ethers } from "ethers";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Init Firebase Admin
initializeApp();
const db = getFirestore();

// Configuration for RPC and Contract
// These should be set in your Firebase environment variables
const RPC_URL = process.env.SEPOLIA_RPC_URL;
const PRIVATE_KEY = process.env.MINER_PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.MINING_CONTRACT_ADDRESS;

const CONTRACT_ABI = [
  "function mine() external",
  "function miningPoints(address) view returns (uint256)",
  "function miningLevel(address) view returns (uint256)"
];

export const mine = onRequest({ cors: true }, async (reqRaw, resRaw) => {
  /** @type {any} */
  const req = reqRaw;
  /** @type {any} */
  const res = resRaw;

  try {
    // Basic method check
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    // Initialize Ethers provider and signer
    // Note: In a production environment, ensure providers are reliable (e.g. Alchemy, Infura)
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const signer = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    // Execute the mine transaction
    console.log(`Initiating mining transaction for ${signer.address}...`);
    const tx = await contract.mine();
    
    // Wait for transaction confirmation
    const receipt = await tx.wait();
    console.log(`Transaction confirmed: ${tx.hash}`);

    // Fetch updated state from the contract
    const points = await contract.miningPoints(signer.address);
    const level = await contract.miningLevel(signer.address);

    const now = Date.now();

    // Sync the new state to Firestore for the frontend to react to
    // Crucial: We must set 'lastMinedAt' so the frontend subscription picks it up
    await db.collection("miners").doc(signer.address).set({
      points: points.toString(),
      level: level.toString(),
      lastTx: tx.hash,
      lastMinedAt: now,
      updatedAt: new Date(now).toISOString()
    }, { merge: true });

    // Respond to the client
    res.json({
      status: "success",
      txHash: tx.hash,
      points: points.toString(),
      level: level.toString(),
      lastMinedAt: now
    });
  } catch (err) {
    console.error("Mining error:", err);
    res.status(500).json({ 
        status: "error", 
        message: err.message || "An error occurred during the mining process." 
    });
  }
});
