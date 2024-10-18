# DLT Service Consumer Documentation

This document provides guidance for consumers who wish to interact with the DLT Service API to query and invoke chaincode on a Hyperledger Fabric network.

## Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
- [API Authentication](#api-authentication)
  - [API Key](#api-key)
  - [HMAC Signature](#hmac-signature)
- [API Endpoints](#api-endpoints)
  - [Read Request](#read-request)
  - [Write Request](#write-request)
- [Scripts for API Calls](#scripts-for-api-calls)
  - [Read Script](#read-script)
  - [Create Asset Script](#create-asset-script)

## API URL and Port

- **API Base URL**: `<your-api-url>`
- **Port**: `<your-api-port>`

Replace the placeholders in the cURL commands and scripts below with your actual API URL and port before making any requests.

## Overview

The DLT Service API allows consumers to securely interact with the Hyperledger Fabric network. You can use this service to query the ledger and submit transactions using chaincode.

## Getting Started

To start using the DLT Service, you need:

1. **API Key**: A unique API key for authentication.
2. **HMAC Signature**: A generated HMAC signature for verifying the integrity of requests.

## API Authentication

### API Key

Each request must include an API key in the `x-api-key` header. You will receive this API key from the service administrator.

### HMAC Signature

Each request must also include a valid HMAC signature. The HMAC signature is generated using the request body (payload) and a timestamp.

Headers required for HMAC authentication:

- `x-signature`: HMAC signature calculated using the secret (`HMAC_SECRET`) and payload.
- `x-timestamp`: A UNIX timestamp included in the HMAC generation process.

## API Endpoints

### Read Request

**Endpoint**: `POST /v1/read`

**Example Request**:

  ```bash
  curl -X POST <your-api-url>:<your-api-port>/v1/read \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_default_api_key" \
  -H "x-signature: <calculated-signature>" \
  -H "x-timestamp: <timestamp>" \
  -d '{"functionName": "ReadAsset", "args": ["asset1"]}'
  ```

### Write Request

**Endpoint**: `POST /v1/write`

**Example Request**:

  ```bash
  curl -X POST <your-api-url>:<your-api-port>/v1/write \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_default_api_key" \
  -H "x-signature: <calculated-signature>" \
  -H "x-timestamp: <timestamp>" \
  -d '{"functionName": "CreateAsset", "args": ["asset2", "blue", "10", "Alice", "5000"]}'
  ```

## Scripts for API Calls

To streamline making API requests to the DLT Service, we have created two shell scripts: `./scripts/read_asset.sh` for reading assets from the ledger and `./scripts/create_asset.sh` for creating new assets on the ledger. These scripts automatically handle the generation of HMAC signatures and execution of the respective cURL commands.

### 1. `./scripts/create_asset.sh`

This script creates an asset on the ledger by invoking the `CreateAsset` chaincode function.

#### How to Run:

1. **Give the script execute permissions** by running the following command:
  ```bash
   chmod +x ./scripts/create_asset.sh
  ```
2. **Run the script:**:
  ```bash
  ./scripts/create_asset.sh
  ```
  This script generates an HMAC signature using the payload and timestamp and sends a POST request to the /write endpoint to retrieve asset details from the ledger.

### 2. `./scripts/read_asset.sh`

This script reads an asset from the ledger by invoking the `ReadAsset` chaincode function.

#### How to Run:

1. **Give the script execute permissions** by running the following command:
  ```bash
   chmod +x ./scripts/read_asset.sh
  ```
2. **Run the script:**
  ```bash
  ./scripts/read_asset.sh
  ```
  
This script generates an HMAC signature using the payload and timestamp and sends a POST request to the /read endpoint to retrieve asset details from the ledger.

In both examples, make sure to replace `<your-api-url>` and `<your-api-port>` with the actual API URL and port before running the cURL requests or executing scripts.
