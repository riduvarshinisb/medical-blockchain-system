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
import { createBlockchainLog, getLogsByRecordId } from "../models/blockchainModel.js";

const autoVerifyReport = async (report) => {
  try {
    // Skip blockchain call if already tampered — just return false
    if (report.is_tampered) {
      return false;
    }

    const currentHash = await generateHashFromUrl(report.file_url);

    let sourceHash = report.file_hash;
    try {
      const blockchainRecord = await contract.getRecord(
        report.blockchain_record_id
      );
      sourceHash = blockchainRecord[1];
      console.log(`Blockchain hash for ${report.blockchain_record_id}: ${sourceHash}`);
    } catch (err) {
      console.log("Blockchain fetch failed, using MySQL fallback:", err.message);
    }

    const isAuthentic = currentHash === sourceHash;

    if (!isAuthentic && !report.is_tampered) {
      await markReportAsTampered(report.id);
      console.log(`⚠️ Tampering detected in report #${report.id}`);
      const existingLogs = await getLogsByRecordId(report.blockchain_record_id);
      const hasVerifyLog = existingLogs.some(l => l.action === "verify");
      if (!hasVerifyLog) {
        await createBlockchainLog(
          report.blockchain_record_id,
          "report",
          "verify",
          currentHash,
          null,
          null,
          false
        );
      }
    }

    return isAuthentic;
  } catch (error) {
    console.error(`Auto-verify failed for report #${report.id}:`, error.message);
    return true;
  }
};

const uploadReport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const { patientId, reportType } = req.body;

    if (!patientId || !reportType) {
      return res.status(400).json({ success: false, message: "Patient ID and report type are required" });
    }

    const fileHash = generateHashFromBuffer(req.file.buffer);
    console.log("✅ File hash generated:", fileHash);

    const cloudinaryResult = await uploadToCloudinary(req.file.buffer, {
      folder: "medical-blockchain/reports",
      resource_type: "auto",
    });
    console.log("✅ File uploaded to Cloudinary:", cloudinaryResult.url);

    const blockchainRecordId = `RPT-${uuidv4()}`;

    const tx = await contract.storeRecord(
      blockchainRecordId,
      reportType,
      fileHash,
      cloudinaryResult.url
    );

    const receipt = await tx.wait();
    const txHash = receipt.hash || receipt.transactionHash || tx.hash || null;
    console.log("✅ Hash stored on blockchain! TX:", txHash);

    const reportId = await createReport(
      patientId,
      req.user.userId,
      reportType,
      cloudinaryResult.url,
      fileHash,
      txHash,
      blockchainRecordId
    );

    await createBlockchainLog(
      blockchainRecordId,
      "report",
      "store",
      fileHash,
      txHash,
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
        blockchainTx: txHash,
        fileUrl: cloudinaryResult.url,
      },
    });
  } catch (error) {
    console.error("Upload report error:", error);
    res.status(500).json({ success: false, message: "Failed to upload report: " + error.message });
  }
};

const getReports = async (req, res) => {
  try {
    const reports = await getAllReports();

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

    res.status(200).json({ success: true, data: verifiedReports });
  } catch (error) {
    console.error("Get reports error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getReport = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await getReportById(id);

    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

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
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

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

    res.status(200).json({ success: true, data: verifiedReports });
  } catch (error) {
    console.error("Get patient reports error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export { uploadReport, getReports, getReport, getPatientReports };