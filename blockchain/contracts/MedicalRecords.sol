// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MedicalRecords {
    
    address public owner;

    struct Record {
        string recordId;
        string recordType;
        string fileHash;
        string fileUrl;
        address uploadedBy;
        uint256 timestamp;
        bool exists;
    }

    mapping(string => Record) private records;
    string[] private recordIds;

    event RecordStored(
        string recordId,
        string recordType,
        string fileHash,
        address uploadedBy,
        uint256 timestamp
    );

    event RecordVerified(
        string recordId,
        bool isValid,
        uint256 timestamp
    );

    constructor() {
        owner = msg.sender;
    }

    function storeRecord(
        string memory _recordId,
        string memory _recordType,
        string memory _fileHash,
        string memory _fileUrl
    ) public {
        require(!records[_recordId].exists, "Record already exists");
        require(bytes(_recordId).length > 0, "Record ID cannot be empty");
        require(bytes(_fileHash).length > 0, "File hash cannot be empty");

        records[_recordId] = Record({
            recordId: _recordId,
            recordType: _recordType,
            fileHash: _fileHash,
            fileUrl: _fileUrl,
            uploadedBy: msg.sender,
            timestamp: block.timestamp,
            exists: true
        });

        recordIds.push(_recordId);

        emit RecordStored(
            _recordId,
            _recordType,
            _fileHash,
            msg.sender,
            block.timestamp
        );
    }

    function verifyRecord(
        string memory _recordId,
        string memory _fileHash
    ) public returns (bool) {
        require(records[_recordId].exists, "Record does not exist");

        bool isValid = keccak256(bytes(records[_recordId].fileHash)) == 
                       keccak256(bytes(_fileHash));

        emit RecordVerified(_recordId, isValid, block.timestamp);

        return isValid;
    }

    function getRecord(
        string memory _recordId
    ) public view returns (
        string memory recordType,
        string memory fileHash,
        string memory fileUrl,
        address uploadedBy,
        uint256 timestamp
    ) {
        require(records[_recordId].exists, "Record does not exist");

        Record memory r = records[_recordId];
        return (r.recordType, r.fileHash, r.fileUrl, r.uploadedBy, r.timestamp);
    }

    function recordExists(
        string memory _recordId
    ) public view returns (bool) {
        return records[_recordId].exists;
    }

    function getTotalRecords() public view returns (uint256) {
        return recordIds.length;
    }

    function getAllRecordIds() public view returns (string[] memory) {
        require(msg.sender == owner, "Only owner can view all records");
        return recordIds;
    }
}