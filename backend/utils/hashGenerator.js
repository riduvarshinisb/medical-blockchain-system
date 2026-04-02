import crypto from "crypto";
import fs from "fs";
import https from "https";
import http from "http";

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

// Fetch file from URL and generate SHA-256 hash
const generateHashFromUrl = (url) => {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;
    protocol.get(url, (res) => {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => {
        const buffer = Buffer.concat(chunks);
        const hash = crypto.createHash("sha256").update(buffer).digest("hex");
        resolve(hash);
      });
      res.on("error", reject);
    }).on("error", reject);
  });
};

export {
  generateHashFromBuffer,
  generateHashFromFile,
  generateHashFromString,
  generateHashFromUrl,
};