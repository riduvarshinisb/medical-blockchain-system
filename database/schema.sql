-- Medical Blockchain System Database Schema

CREATE DATABASE IF NOT EXISTS medical_blockchain;
USE medical_blockchain;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'doctor', 'pharmacy', 'lab') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    age INT,
    gender ENUM('male', 'female', 'other'),
    contact VARCHAR(20),
    address TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    uploaded_by INT NOT NULL,
    report_type VARCHAR(100),
    file_url VARCHAR(500),
    file_hash VARCHAR(255),
    blockchain_tx VARCHAR(255),
    blockchain_record_id VARCHAR(255),
    is_tampered BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

CREATE TABLE bills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    uploaded_by INT NOT NULL,
    bill_amount DECIMAL(10,2),
    file_url VARCHAR(500),
    file_hash VARCHAR(255),
    blockchain_tx VARCHAR(255),
    blockchain_record_id VARCHAR(255),
    is_tampered BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

CREATE TABLE blockchain_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    record_id VARCHAR(255),
    record_type ENUM('report', 'bill'),
    action ENUM('store', 'verify'),
    file_hash VARCHAR(255),
    blockchain_tx VARCHAR(255),
    performed_by INT,
    is_valid BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (performed_by) REFERENCES users(id)
);