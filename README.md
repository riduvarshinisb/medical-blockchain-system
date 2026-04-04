# MedChain — Medical Report Management and Distribution System on Blockchain

A blockchain-powered healthcare data management system that ensures the integrity, authenticity, and secure distribution of medical reports and pharmacy bills.

Built as a Final Year Project demonstrating the application of blockchain technology in healthcare security.

---

## The Problem

Traditional centralized healthcare systems allow unauthorized modifications to medical records and pharmacy bills. This leads to:
- Fraudulent medical reports
- Altered pharmacy bills
- No way to detect tampering after the fact
- No audit trail of who accessed what and when

## The Solution

MedChain uses **SHA-256 cryptographic hashing** combined with **Ethereum blockchain storage** to create a tamper-proof system. Once a record is uploaded, its fingerprint is stored permanently on the blockchain. Any modification to the file — even a single character — is instantly detected.

---

## Key Features

- **Real-time tamper detection** — every record is automatically verified on access
- **Role-based access control** — four distinct roles with granular permissions
- **Blockchain immutability** — file hashes stored permanently on Ethereum Sepolia
- **Complete audit trail** — every action logged with timestamp and user
- **Secure file storage** — files stored on Cloudinary with signed uploads only
- **Patient management** — full patient registry with CRUD operations
- **Professional UI** — clean, formal interface built for hospital staff

---

## System Architecture
```
User uploads file
      ↓
SHA-256 hash generated from file buffer
      ↓
File uploaded to Cloudinary (secure cloud storage)
      ↓
Hash stored permanently on Ethereum Sepolia blockchain
      ↓
Metadata stored in MySQL database
      ↓
Every subsequent access → file re-fetched → hash recomputed → compared with blockchain hash
      ↓
Mismatch detected → record flagged as ALTERED instantly
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js |
| Styling | IBM Plex fonts, custom CSS |
| Backend | Node.js + Express |
| Database | MySQL |
| Blockchain | Ethereum Sepolia Testnet |
| Smart Contract | Solidity + Hardhat |
| Web3 | Ethers.js |
| File Storage | Cloudinary |
| Hashing | SHA-256 (Node.js crypto) |
| Authentication | JWT + bcrypt |

---

## Roles & Permissions

| Role | Permissions |
|---|---|
| **Hospital Admin** | Manage users, manage patients, view all records, view audit log |
| **Doctor** | View patient reports and bills, see integrity status |
| **Pharmacy Admin** | Upload pharmacy bills, view bill history |
| **Lab Staff** | Upload medical reports, view report history |

---

## Smart Contract

- **Network:** Ethereum Sepolia Testnet
- **Contract Address:** `0x949f24C718c3561f8151521831f503F2e9440EC0`
- **View on Etherscan:** [sepolia.etherscan.io](https://sepolia.etherscan.io/address/0x949f24C718c3561f8151521831f503F2e9440EC0)

### Contract Functions
- `storeRecord()` — stores file hash on blockchain when a record is uploaded
- `verifyRecord()` — compares a hash against the stored hash
- `getRecord()` — retrieves record details
- `recordExists()` — checks if a record exists

---

## Database Schema

- **users** — staff accounts with hashed passwords and roles
- **patients** — patient registry
- **reports** — medical report metadata and integrity status
- **bills** — pharmacy bill metadata and integrity status
- **blockchain_logs** — complete audit trail of all actions

---

## Setup Instructions

### Prerequisites
- Node.js v18+
- MySQL 8.0+
- MetaMask wallet with Sepolia ETH
- Cloudinary account
- Alchemy account (Sepolia RPC URL)

### 1. Clone the repository
```bash
git clone https://github.com/riduvarshinisb/medical-blockchain-system.git
cd medical-blockchain-system
```

### 2. Set up environment variables
Create a `.env` file in the root folder:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=medical_blockchain
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
SEPOLIA_RPC_URL=your_alchemy_sepolia_url
PRIVATE_KEY=your_metamask_private_key
CONTRACT_ADDRESS=0x949f24C718c3561f8151521831f503F2e9440EC0
JWT_SECRET=your_jwt_secret
PORT=5000
```

### 3. Set up MySQL database
```bash
mysql -u root -p
```
```sql
CREATE DATABASE medical_blockchain;
USE medical_blockchain;
SOURCE database/schema.sql;
```

### 4. Install backend dependencies
```bash
cd backend
npm install
```

### 5. Install frontend dependencies
```bash
cd frontend
npm install
```

### 6. Start the backend
```bash
cd backend
node server.js
```

### 7. Start the frontend
```bash
cd frontend
npm start
```

### 8. Create the first admin user
```bash
cd backend
node -e "import('bcryptjs').then(m => m.default.hash('Admin@123', 12).then(h => console.log(h)))"
```
Then insert into MySQL:
```sql
INSERT INTO users (name, email, password, role)
VALUES ('Hospital Admin', 'admin@hospital.com', 'HASH_FROM_ABOVE', 'admin');
```

---

## How Tamper Detection Works

1. When a file is uploaded, SHA-256 generates a unique fingerprint
2. This fingerprint is stored on the Ethereum blockchain (immutable)
3. Every time the record is accessed, the system re-downloads the file
4. A new SHA-256 hash is generated from the current file
5. If the hashes match → **AUTHENTIC** 
6. If the hashes don't match → **ALTERED**  and admin is alerted instantly

This means even if someone modifies the file by a single pixel or character, it is detected immediately on the next access.

---

## Security Features

- Passwords hashed with bcrypt (12 salt rounds)
- JWT authentication with 24-hour expiry
- Role-based access control on every API endpoint
- Signed Cloudinary uploads (no direct browser uploads)
- File type validation (PDF, JPG, PNG only)
- File size limit (10MB)
- SQL injection prevention via parameterized queries

---

## Limitations & Future Work

- The system guarantees integrity of records after upload, not authenticity of the original upload
- Digital signature infrastructure (PKI) would be needed to verify the identity of the uploader cryptographically
- Currently supports single hospital deployment; multi-hospital federation is a future enhancement

---

## Project Structure
```
medical-blockchain-system/
├── backend/          — Node.js + Express API
├── blockchain/       — Solidity smart contract + Hardhat
├── database/         — MySQL schema
└── frontend/         — React.js application
```

---
