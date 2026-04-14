import { v4 as uuidv4 } from "uuid";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";
import { generateHashFromBuffer, generateHashFromUrl } from "../utils/hashGenerator.js";
import { contract } from "../config/blockchain.js";
import {
  createReport,
  getAllReports,
  getReportById,
  getReportsByPatientId,
  markReportAsTampered,
} from "../models/reportModel.js";
import { createBlockchainLog } from "../models/blockchainModel.js";

// Auto verify a report by comparing hashes
const autoVerifyReport = async (report) => {
  try {
    if (!report.file_url || !report.file_hash || !report.blockchain_record_id) {
      return true;
    }

    // Step 1: Re-fetch file from Cloudinary and regenerate hash
    const currentHash = await generateHashFromUrl(report.file_url);

    // Step 2: Get the original hash from BLOCKCHAIN (source of truth)
    let blockchainHash = report.file_hash; // fallback to MySQL
    try {
      const blockchainRecord = await contract.getRecord(report.blockchain_record_id);
      blockchainHash = blockchainRecord[1]; // fileHash is index 1 in the tuple
      console.log(`Blockchain hash for ${report.blockchain_record_id}: ${blockchainHash}`);
    } catch (err) {
      console.log("Could not fetch from blockchain, using MySQL hash as fallback:", err.message);
    }

    // Step 3: Compare current file hash against BLOCKCHAIN hash
    const isAuthentic = currentHash === blockchainHash;

    if (!isAuthentic && !report.is_tampered) {
      await markReportAsTampered(report.id);
      console.log(`Tampering detected in report #${report.id}`);
      await createBlockchainLog(
  report.blockchain_record_id,
  "report",
  "verify",
  currentHash,
  null,              // blockchainTx — no tx for verify
  null,              // performedBy — system action
  false              // isValid
);
    }

    return isAuthentic;
  } catch (error) {
    console.error(`Auto-verify failed for report #${report.id}:`, error.message);
    return true;
  }
};

// Upload a new report
const uploadReport = async (req, res) => {
  try {
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

const receipt = await tx.wait();
const txHash = receipt.hash || receipt.transactionHash || tx.hash || "pending";
console.log("✅ Hash stored on blockchain! TX:", txHash);

    // Step 5: Save metadata to MySQL database
    const reportId = await createReport(
  patientId,
  req.user.userId,
  reportType,
  cloudinaryResult.url,
  fileHash,
  txHash,
  blockchainRecordId
);

    // Step 6: Log to blockchain_logs
    await createBlockchainLog(
  blockchainRecordId,  // recordId
  "report",            // recordType
  "store",             // action
  fileHash,            // fileHash
  txHash,              // blockchainTx ← use the tx hash here
  req.user.userId,     // performedBy ← user ID goes here
  true                 // isValid
);

    res.status(201).json({
      success: true,
      message: "Report uploaded and secured successfully",
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

// Get all reports with auto-verification
const getReports = async (req, res) => {
  try {
    const reports = await getAllReports();

    // Auto-verify all reports in background
    const verifiedReports = await Promise.all(
      reports.map(async (report) => {
        if (report.file_url && report.file_hash) {
          const isAuthentic = await autoVerifyReport(report);
          return {
            ...report,
            is_tampered: !isAuthentic,
            integrity_status: isAuthentic ? "AUTHENTIC" : "ALTERED",
          };
        }
        return {
          ...report,
          integrity_status: report.is_tampered ? "ALTERED" : "AUTHENTIC",
        };
      })
    );

    res.status(200).json({
      success: true,
      data: verifiedReports,
    });
  } catch (error) {
    console.error("Get reports error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get single report with auto-verification
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

    // Auto-verify this report
    let isAuthentic = true;
    if (report.file_url && report.file_hash) {
      isAuthentic = await autoVerifyReport(report);
    }

    res.status(200).json({
      success: true,
      data: {
        ...report,
        is_tampered: !isAuthentic,
        integrity_status: isAuthentic ? "AUTHENTIC" : "ALTERED",
      },
    });
  } catch (error) {
    console.error("Get report error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get reports by patient with auto-verification
const getPatientReports = async (req, res) => {
  try {
    const { patientId } = req.params;
    const reports = await getReportsByPatientId(patientId);

    const verifiedReports = await Promise.all(
      reports.map(async (report) => {
        if (report.file_url && report.file_hash) {
          const isAuthentic = await autoVerifyReport(report);
          return {
            ...report,
            is_tampered: !isAuthentic,
            integrity_status: isAuthentic ? "AUTHENTIC" : "ALTERED",
          };
        }
        return {
          ...report,
          integrity_status: report.is_tampered ? "ALTERED" : "AUTHENTIC",
        };
      })
    );

    res.status(200).json({
      success: true,
      data: verifiedReports,
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