import crypto from "crypto";
import fs from "fs";

// Generate SHA-256 hash from a file buffer
const generateHashFromBuffer = (buffer) => {
  return crypto.createHash("sha256").update(buffer).digest("hex");
};

// Generate SHA-256 hash from a file path
const generateHashFromFile = (filePath) => {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(fileBuffer).digest("hex");
};

// Generate SHA-256 hash from a string
const generateHashFromString = (str) => {
  return crypto.createHash("sha256").update(str).digest("hex");
};

export {
  generateHashFromBuffer,
  generateHashFromFile,
  generateHashFromString,
};