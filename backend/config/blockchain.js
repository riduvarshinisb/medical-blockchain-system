import { ethers } from "ethers";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config({ path: "../.env" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load contract ABI from compiled artifacts
const artifactPath = path.join(
  __dirname,
  "../../blockchain/artifacts/contracts/MedicalRecords.sol/MedicalRecords.json"
);

const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
const contractABI = artifact.abi;

// Create provider and signer
const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Create contract instance
const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  contractABI,
  signer
);

// Test blockchain connection
const testBlockchainConnection = async () => {
  try {
    const network = await provider.getNetwork();
    console.log(`✅ Blockchain connected! Network: ${network.name}`);
    const balance = await provider.getBalance(signer.address);
    console.log(`✅ Wallet balance: ${ethers.formatEther(balance)} ETH`);
  } catch (error) {
    console.error("❌ Blockchain connection failed:", error.message);
  }
};

testBlockchainConnection();

export { provider, signer, contract };