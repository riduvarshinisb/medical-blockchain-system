import { v4 as uuidv4 } from "uuid";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";
import { generateHashFromBuffer } from "../utils/hashGenerator.js";
import { contract } from "../config/blockchain.js";
import {
  createBill,
  getAllBills,
  getBillById,
  getBillsByPatientId,
} from "../models/billModel.js";
import { createBlockchainLog } from "../models/blockchainModel.js";

// Upload a new bill
const uploadBill = async (req, res) => {
  try {
    // Check if file was uploaded
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

    // Wait for transaction confirmation
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
      message: "Bill uploaded and secured on blockchain successfully",
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

// Get all bills
const getBills = async (req, res) => {
  try {
    const bills = await getAllBills();
    res.status(200).json({
      success: true,
      data: bills,
    });
  } catch (error) {
    console.error("Get bills error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get single bill by ID
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

    res.status(200).json({
      success: true,
      data: bill,
    });
  } catch (error) {
    console.error("Get bill error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get bills by patient ID
const getPatientBills = async (req, res) => {
  try {
    const { patientId } = req.params;
    const bills = await getBillsByPatientId(patientId);

    res.status(200).json({
      success: true,
      data: bills,
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