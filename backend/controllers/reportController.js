import { v4 as uuidv4 } from "uuid";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";
import { generateHashFromBuffer } from "../utils/hashGenerator.js";
import { contract } from "../config/blockchain.js";
import {
  createReport,
  getAllReports,
  getReportById,
  getReportsByPatientId,
  markReportAsTampered,
} from "../models/reportModel.js";
import { createBlockchainLog } from "../models/blockchainModel.js";

// Upload a new report
const uploadReport = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const { patientId, reportType } = req.body;

    if (!patientId || !reportType) {
      return res.status(400).json({
        success: false,
        message: "Patient ID and report type are required",
      });
    }

    // Step 1: Generate SHA-256 hash from file buffer
    const fileHash = generateHashFromBuffer(req.file.buffer);
    console.log("✅ File hash generated:", fileHash);

    // Step 2: Upload file to Cloudinary
    const cloudinaryResult = await uploadToCloudinary(req.file.buffer, {
      folder: "medical-blockchain/reports",
      resource_type: "auto",
    });
    console.log("✅ File uploaded to Cloudinary:", cloudinaryResult.url);

    // Step 3: Generate unique record ID for blockchain
    const blockchainRecordId = `RPT-${uuidv4()}`;

    // Step 4: Store hash on blockchain
    const tx = await contract.storeRecord(
      blockchainRecordId,
      reportType,
      fileHash,
      cloudinaryResult.url
    );

    // Wait for transaction confirmation
    const receipt = await tx.wait();
    console.log("✅ Hash stored on blockchain! TX:", receipt.hash);

    // Step 5: Save metadata to MySQL database
    const reportId = await createReport(
      patientId,
      req.user.userId,
      reportType,
      cloudinaryResult.url,
      fileHash,
      receipt.hash,
      blockchainRecordId
    );

    // Step 6: Log to blockchain_logs
    await createBlockchainLog(
      blockchainRecordId,
      "report",
      "store",
      fileHash,
      receipt.hash,
      req.user.userId,
      true
    );

    res.status(201).json({
      success: true,
      message: "Report uploaded and secured on blockchain successfully",
      data: {
        reportId,
        blockchainRecordId,
        fileHash,
        blockchainTx: receipt.hash,
        fileUrl: cloudinaryResult.url,
      },
    });
  } catch (error) {
    console.error("Upload report error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload report: " + error.message,
    });
  }
};

// Get all reports
const getReports = async (req, res) => {
  try {
    const reports = await getAllReports();
    res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (error) {
    console.error("Get reports error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get single report by ID
const getReport = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await getReportById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error("Get report error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get reports by patient ID
const getPatientReports = async (req, res) => {
  try {
    const { patientId } = req.params;
    const reports = await getReportsByPatientId(patientId);

    res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (error) {
    console.error("Get patient reports error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export {
  uploadReport,
  getReports,
  getReport,
  getPatientReports,
};