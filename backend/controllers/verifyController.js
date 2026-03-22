import { generateHashFromBuffer } from "../utils/hashGenerator.js";
import { contract } from "../config/blockchain.js";
import { getReportById, markReportAsTampered } from "../models/reportModel.js";
import { getBillById, markBillAsTampered } from "../models/billModel.js";
import { createBlockchainLog, getAllLogs, getLogsByRecordId } from "../models/blockchainModel.js";

// Verify a report
const verifyReport = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if file was uploaded for verification
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
    console.log("✅ Uploaded file hash:", uploadedFileHash);
    console.log("✅ Stored file hash:", report.file_hash);

    // Step 3: Verify hash on blockchain
    const isValid = await contract.verifyRecord(
      report.blockchain_record_id,
      uploadedFileHash
    );

    // Step 4: Get transaction receipt
    const tx = await isValid.wait();
    console.log("✅ Blockchain verification TX:", tx.hash);

    // Step 5: If tampered, mark in database
    if (!isValid) {
      await markReportAsTampered(id);
    }

    // Step 6: Log verification
    await createBlockchainLog(
      report.blockchain_record_id,
      "report",
      "verify",
      uploadedFileHash,
      tx.hash,
      req.user.userId,
      isValid
    );

    res.status(200).json({
      success: true,
      data: {
        reportId: id,
        isValid,
        status: isValid ? "✅ VERIFIED - Not Tampered" : "❌ TAMPERED - Hash Mismatch",
        uploadedFileHash,
        storedFileHash: report.file_hash,
        blockchainRecordId: report.blockchain_record_id,
        verificationTx: tx.hash,
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

// Verify a bill
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
    console.log("✅ Uploaded file hash:", uploadedFileHash);
    console.log("✅ Stored file hash:", bill.file_hash);

    // Step 3: Verify hash on blockchain
    const isValid = await contract.verifyRecord(
      bill.blockchain_record_id,
      uploadedFileHash
    );

    // Step 4: Get transaction receipt
    const tx = await isValid.wait();
    console.log("✅ Blockchain verification TX:", tx.hash);

    // Step 5: If tampered, mark in database
    if (!isValid) {
      await markBillAsTampered(id);
    }

    // Step 6: Log verification
    await createBlockchainLog(
      bill.blockchain_record_id,
      "bill",
      "verify",
      uploadedFileHash,
      tx.hash,
      req.user.userId,
      isValid
    );

    res.status(200).json({
      success: true,
      data: {
        billId: id,
        isValid,
        status: isValid ? "✅ VERIFIED - Not Tampered" : "❌ TAMPERED - Hash Mismatch",
        uploadedFileHash,
        storedFileHash: bill.file_hash,
        blockchainRecordId: bill.blockchain_record_id,
        verificationTx: tx.hash,
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

// Get all audit logs (admin only)
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