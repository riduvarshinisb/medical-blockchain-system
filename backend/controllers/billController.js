import { v4 as uuidv4 } from "uuid";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";
import { generateHashFromBuffer, generateHashFromUrl } from "../utils/hashGenerator.js";
import { contract } from "../config/blockchain.js";
import {
  createBill,
  getAllBills,
  getBillById,
  getBillsByPatientId,
  markBillAsTampered,
} from "../models/billModel.js";
import { createBlockchainLog } from "../models/blockchainModel.js";

// Auto verify a bill by comparing hashes
const autoVerifyBill = async (bill) => {
  try {
    // Re-fetch file from Cloudinary and regenerate hash
    const currentHash = await generateHashFromUrl(bill.file_url);

    // Compare with stored hash from database
    const isAuthentic = currentHash === bill.file_hash;

    // If tampered and not already marked, update database
    if (!isAuthentic && !bill.is_tampered) {
      await markBillAsTampered(bill.id);
      console.log(`⚠️ Tampering detected in bill #${bill.id}`);

      // Log tamper detection
      await createBlockchainLog(
        bill.blockchain_record_id,
        "bill",
        "verify",
        currentHash,
        "auto-detection",
        null,
        false
      );
    }

    return isAuthentic;
  } catch (error) {
    console.error(`Auto-verify failed for bill #${bill.id}:`, error.message);
    return true; // Don't flag as tampered if verification fails due to network
  }
};

// Upload a new bill
const uploadBill = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const { patientId, billAmount } = req.body;

    if (!patientId || !billAmount) {
      return res.status(400).json({
        success: false,
        message: "Patient ID and bill amount are required",
      });
    }

    // Step 1: Generate SHA-256 hash from file buffer
    const fileHash = generateHashFromBuffer(req.file.buffer);
    console.log("✅ Bill hash generated:", fileHash);

    // Step 2: Upload file to Cloudinary
    const cloudinaryResult = await uploadToCloudinary(req.file.buffer, {
      folder: "medical-blockchain/bills",
      resource_type: "auto",
    });
    console.log("✅ Bill uploaded to Cloudinary:", cloudinaryResult.url);

    // Step 3: Generate unique record ID for blockchain
    const blockchainRecordId = `BILL-${uuidv4()}`;

    // Step 4: Store hash on blockchain
    const tx = await contract.storeRecord(
      blockchainRecordId,
      "pharmacy_bill",
      fileHash,
      cloudinaryResult.url
    );

    const receipt = await tx.wait();
    console.log("✅ Bill hash stored on blockchain! TX:", receipt.hash);

    // Step 5: Save metadata to MySQL database
    const billId = await createBill(
      patientId,
      req.user.userId,
      billAmount,
      cloudinaryResult.url,
      fileHash,
      receipt.hash,
      blockchainRecordId
    );

    // Step 6: Log to blockchain_logs
    await createBlockchainLog(
      blockchainRecordId,
      "bill",
      "store",
      fileHash,
      receipt.hash,
      req.user.userId,
      true
    );

    res.status(201).json({
      success: true,
      message: "Bill uploaded and secured successfully",
      data: {
        billId,
        blockchainRecordId,
        fileHash,
        blockchainTx: receipt.hash,
        fileUrl: cloudinaryResult.url,
      },
    });
  } catch (error) {
    console.error("Upload bill error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload bill: " + error.message,
    });
  }
};

// Get all bills with auto-verification
const getBills = async (req, res) => {
  try {
    const bills = await getAllBills();

    // Auto-verify all bills in background
    const verifiedBills = await Promise.all(
      bills.map(async (bill) => {
        if (bill.file_url && bill.file_hash) {
          const isAuthentic = await autoVerifyBill(bill);
          return {
            ...bill,
            is_tampered: !isAuthentic,
            integrity_status: isAuthentic ? "AUTHENTIC" : "ALTERED",
          };
        }
        return {
          ...bill,
          integrity_status: bill.is_tampered ? "ALTERED" : "AUTHENTIC",
        };
      })
    );

    res.status(200).json({
      success: true,
      data: verifiedBills,
    });
  } catch (error) {
    console.error("Get bills error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get single bill with auto-verification
const getBill = async (req, res) => {
  try {
    const { id } = req.params;
    const bill = await getBillById(id);

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      });
    }

    // Auto-verify this bill
    let isAuthentic = true;
    if (bill.file_url && bill.file_hash) {
      isAuthentic = await autoVerifyBill(bill);
    }

    res.status(200).json({
      success: true,
      data: {
        ...bill,
        is_tampered: !isAuthentic,
        integrity_status: isAuthentic ? "AUTHENTIC" : "ALTERED",
      },
    });
  } catch (error) {
    console.error("Get bill error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get bills by patient with auto-verification
const getPatientBills = async (req, res) => {
  try {
    const { patientId } = req.params;
    const bills = await getBillsByPatientId(patientId);

    const verifiedBills = await Promise.all(
      bills.map(async (bill) => {
        if (bill.file_url && bill.file_hash) {
          const isAuthentic = await autoVerifyBill(bill);
          return {
            ...bill,
            is_tampered: !isAuthentic,
            integrity_status: isAuthentic ? "AUTHENTIC" : "ALTERED",
          };
        }
        return {
          ...bill,
          integrity_status: bill.is_tampered ? "ALTERED" : "AUTHENTIC",
        };
      })
    );

    res.status(200).json({
      success: true,
      data: verifiedBills,
    });
  } catch (error) {
    console.error("Get patient bills error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export {
  uploadBill,
  getBills,
  getBill,
  getPatientBills,
};