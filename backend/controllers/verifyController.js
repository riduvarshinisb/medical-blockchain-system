import { generateHashFromBuffer, generateHashFromUrl } from "../utils/hashGenerator.js";
import { contract } from "../config/blockchain.js";
import { getReportById, markReportAsTampered } from "../models/reportModel.js";
import { getBillById, markBillAsTampered } from "../models/billModel.js";
import { createBlockchainLog, getAllLogs, getLogsByRecordId } from "../models/blockchainModel.js";

// Manual verify a report — for official proof
const verifyReport = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload the file to verify",
      });
    }

    // Step 1: Get report from database
    const report = await getReportById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    // Step 2: Generate hash from uploaded file
    const uploadedFileHash = generateHashFromBuffer(req.file.buffer);

    // Step 3: Also fetch from Cloudinary and hash for double check
    let cloudinaryHash = null;
    try {
      cloudinaryHash = await generateHashFromUrl(report.file_url);
    } catch (err) {
      console.error("Could not fetch from Cloudinary:", err.message);
    }

    // Step 4: Compare uploaded file hash with stored hash
    const uploadMatchesStored = uploadedFileHash === report.file_hash;

    // Step 5: Compare Cloudinary file hash with stored hash
    const cloudinaryMatchesStored = cloudinaryHash
      ? cloudinaryHash === report.file_hash
      : true;

    // Step 6: Both must match for record to be authentic
    const isValid = uploadMatchesStored && cloudinaryMatchesStored;

    // Step 7: If tampered, mark in database
    if (!isValid) {
      await markReportAsTampered(id);
    }

    // Step 8: Log verification
    await createBlockchainLog(
      report.blockchain_record_id,
      "report",
      "verify",
      uploadedFileHash,
      report.blockchain_tx,
      req.user.userId,
      isValid
    );

    // Step 9: Determine exact reason for tampering
    let tamperReason = null;
    if (!uploadMatchesStored && !cloudinaryMatchesStored) {
      tamperReason = "Both the uploaded file and the stored file have been altered";
    } else if (!uploadMatchesStored) {
      tamperReason = "The uploaded file does not match the original record";
    } else if (!cloudinaryMatchesStored) {
      tamperReason = "The stored file in the system has been altered";
    }

    res.status(200).json({
      success: true,
      data: {
        reportId: id,
        isValid,
        integrity_status: isValid ? "AUTHENTIC" : "ALTERED",
        message: isValid
          ? "This record is authentic. The file matches the original."
          : `This record has been tampered. ${tamperReason}.`,
        checks: {
          uploadedFileMatchesOriginal: uploadMatchesStored,
          storedFileMatchesOriginal: cloudinaryMatchesStored,
        },
        verifiedAt: new Date().toISOString(),
        verifiedBy: req.user.userId,
      },
    });
  } catch (error) {
    console.error("Verify report error:", error);
    res.status(500).json({
      success: false,
      message: "Verification failed: " + error.message,
    });
  }
};

// Manual verify a bill — for official proof
const verifyBill = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload the file to verify",
      });
    }

    // Step 1: Get bill from database
    const bill = await getBillById(id);
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      });
    }

    // Step 2: Generate hash from uploaded file
    const uploadedFileHash = generateHashFromBuffer(req.file.buffer);

    // Step 3: Also fetch from Cloudinary and hash for double check
    let cloudinaryHash = null;
    try {
      cloudinaryHash = await generateHashFromUrl(bill.file_url);
    } catch (err) {
      console.error("Could not fetch from Cloudinary:", err.message);
    }

    // Step 4: Compare uploaded file hash with stored hash
    const uploadMatchesStored = uploadedFileHash === bill.file_hash;

    // Step 5: Compare Cloudinary file hash with stored hash
    const cloudinaryMatchesStored = cloudinaryHash
      ? cloudinaryHash === bill.file_hash
      : true;

    // Step 6: Both must match for record to be authentic
    const isValid = uploadMatchesStored && cloudinaryMatchesStored;

    // Step 7: If tampered, mark in database
    if (!isValid) {
      await markBillAsTampered(id);
    }

    // Step 8: Log verification
    await createBlockchainLog(
      bill.blockchain_record_id,
      "bill",
      "verify",
      uploadedFileHash,
      bill.blockchain_tx,
      req.user.userId,
      isValid
    );

    // Step 9: Determine exact reason for tampering
    let tamperReason = null;
    if (!uploadMatchesStored && !cloudinaryMatchesStored) {
      tamperReason = "Both the uploaded file and the stored file have been altered";
    } else if (!uploadMatchesStored) {
      tamperReason = "The uploaded file does not match the original record";
    } else if (!cloudinaryMatchesStored) {
      tamperReason = "The stored file in the system has been altered";
    }

    res.status(200).json({
      success: true,
      data: {
        billId: id,
        isValid,
        integrity_status: isValid ? "AUTHENTIC" : "ALTERED",
        message: isValid
          ? "This record is authentic. The file matches the original."
          : `This record has been tampered. ${tamperReason}.`,
        checks: {
          uploadedFileMatchesOriginal: uploadMatchesStored,
          storedFileMatchesOriginal: cloudinaryMatchesStored,
        },
        verifiedAt: new Date().toISOString(),
        verifiedBy: req.user.userId,
      },
    });
  } catch (error) {
    console.error("Verify bill error:", error);
    res.status(500).json({
      success: false,
      message: "Verification failed: " + error.message,
    });
  }
};

// Get all audit logs
const getAuditLogs = async (req, res) => {
  try {
    const logs = await getAllLogs();
    res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (error) {
    console.error("Get audit logs error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get logs by record ID
const getRecordLogs = async (req, res) => {
  try {
    const { recordId } = req.params;
    const logs = await getLogsByRecordId(recordId);
    res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (error) {
    console.error("Get record logs error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export {
  verifyReport,
  verifyBill,
  getAuditLogs,
  getRecordLogs,
};