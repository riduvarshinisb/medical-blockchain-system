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
import { createBlockchainLog, getLogsByRecordId } from "../models/blockchainModel.js";

const autoVerifyBill = async (bill) => {
  try {
    const currentHash = await generateHashFromUrl(bill.file_url);
    const isAuthentic = currentHash === bill.file_hash;

    if (!isAuthentic) {
      if (!bill.is_tampered) {
        await markBillAsTampered(bill.id);
        console.log(`⚠️ Tampering detected in bill #${bill.id}`);
        await createBlockchainLog(
          bill.blockchain_record_id,
          "bill",
          "verify",
          currentHash,
          null,
          null,
          false
        );
      } else {
        const existingLogs = await getLogsByRecordId(bill.blockchain_record_id);
        const hasVerifyLog = existingLogs.some(l => l.action === "verify");
        if (!hasVerifyLog) {
          await createBlockchainLog(
            bill.blockchain_record_id,
            "bill",
            "verify",
            currentHash,
            null,
            null,
            false
          );
        }
      }
    }

    return isAuthentic;
  } catch (error) {
    console.error(`Auto-verify failed for bill #${bill.id}:`, error.message);
    return true;
  }
};

const uploadBill = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const { patientId, billAmount } = req.body;

    if (!patientId || !billAmount) {
      return res.status(400).json({ success: false, message: "Patient ID and bill amount are required" });
    }

    const fileHash = generateHashFromBuffer(req.file.buffer);
    console.log("✅ Bill hash generated:", fileHash);

    const cloudinaryResult = await uploadToCloudinary(req.file.buffer, {
      folder: "medical-blockchain/bills",
      resource_type: "auto",
    });
    console.log("✅ Bill uploaded to Cloudinary:", cloudinaryResult.url);

    const blockchainRecordId = `BILL-${uuidv4()}`;

    const tx = await contract.storeRecord(
      blockchainRecordId,
      "pharmacy_bill",
      fileHash,
      cloudinaryResult.url
    );

    const receipt = await tx.wait();
    const txHash = receipt.hash || receipt.transactionHash || tx.hash || null;
    console.log("✅ Bill hash stored on blockchain! TX:", txHash);

    const billId = await createBill(
      patientId,
      req.user.userId,
      billAmount,
      cloudinaryResult.url,
      fileHash,
      txHash,
      blockchainRecordId
    );

    await createBlockchainLog(
      blockchainRecordId,
      "bill",
      "store",
      fileHash,
      txHash,
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
        blockchainTx: txHash,
        fileUrl: cloudinaryResult.url,
      },
    });
  } catch (error) {
    console.error("Upload bill error:", error);
    res.status(500).json({ success: false, message: "Failed to upload bill: " + error.message });
  }
};

const getBills = async (req, res) => {
  try {
    const bills = await getAllBills();

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

    res.status(200).json({ success: true, data: verifiedBills });
  } catch (error) {
    console.error("Get bills error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getBill = async (req, res) => {
  try {
    const { id } = req.params;
    const bill = await getBillById(id);

    if (!bill) {
      return res.status(404).json({ success: false, message: "Bill not found" });
    }

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
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

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

    res.status(200).json({ success: true, data: verifiedBills });
  } catch (error) {
    console.error("Get patient bills error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export { uploadBill, getBills, getBill, getPatientBills };