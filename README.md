# DLT Service API Documentation

This documentation provides a detailed guide for setting up and using the Distributed Ledger Technology (DLT) Service API, built with Node.js, Hyperledger Fabric, and PostgreSQL. This implementation includes API key authentication and HMAC signature verification for secure transaction and chaincode interactions on a Hyperledger Fabric network.

## Table of Contents

- [Overview](#overview)
- [System Requirements](#system-requirements)
- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [Authentication](#authentication)
  - [API Key Authentication](#api-key-authentication)
  - [HMAC Authentication](#hmac-authentication)
- [API Endpoints](#api-endpoints)
  - [Read Request](#read-request)
  - [Write Request](#write-request)
- [Scripts for API Calls](#scripts-for-api-calls)
- [Error Handling](#error-handling)

## Overview

This DLT Service API is designed to interact with a Hyperledger Fabric network, exposing endpoints for reading from and writing to deployed chaincode. It features two layers of security:

1. **API Key Authentication**: Ensures that only authorized clients can access the API.
2. **HMAC Signature Verification**: Protects the integrity of requests by verifying the payload and timestamp using HMAC-SHA256.

## System Requirements

- **Node.js**: v18.18.0 or higher.
- **Hyperledger Fabric Gateway**: To connect to the Fabric network.
- **PostgreSQL**: To store API keys and manage database operations.
- **Knex.js**: For database migrations (if using).
- **OpenSSL**: For generating HMAC signatures.

## Setup

1. Clone the repository to your local machine:
    ```bash
    git clone <repository-url>
    cd <repository-folder>
    ```

2. Install the dependencies:
    ```bash
    npm install
    ```

3. Set up the PostgreSQL database with the required tables for storing API keys.

4. Configure the `.env` file with the required environment variables (see [Environment Variables](#environment-variables)).

5. Start the application:
    ```bash
    npm start
    ```

The DLT service will be running at `http://localhost:3000`.

## Environment Variables

The service requires several environment variables to function correctly. These variables are defined in a `.env` file located at the project root.

Here’s an example `.env` file:

```bash
# API and HMAC Keys
API_KEY=your_default_api_key
HMAC_SECRET=your_default_hmac_secret

# Server
PORT=3000

# Hyperledger Fabric Configuration
CHANNEL_NAME=mychannel
CHAINCODE_NAME=basic
MSP_ID=Org1MSP
PEER_ENDPOINT=localhost:7051
PEER_HOST_ALIAS=peer0.org1.example.com
CRYPTO_PATH=/path/to/crypto/materials/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com
```

### Environment Variables Breakdown

- **API_KEY**: Default API key for authentication.
- **HMAC_SECRET**: Default secret for generating and verifying HMAC signatures.
- **PORT**: The port where the service will run (default is 3000).
- **CHANNEL_NAME**: The Fabric channel the application will connect to.
- **CHAINCODE_NAME**: The chaincode deployed on the channel.
- **MSP_ID**: The Membership Service Provider ID (MSP) for the organization.
- **PEER_ENDPOINT**: The gRPC endpoint for the peer node.
- **PEER_HOST_ALIAS**: The hostname for the peer node.
- **CRYPTO_PATH**: The path to the Fabric network’s crypto materials.

## Authentication

### API Key Authentication

Each request must include an API key in the `x-api-key` header. The API key is defined in the environment file (`API_KEY`), and requests without a valid API key will be rejected with a `401 Unauthorized` response.

### HMAC Authentication

Each request must also include a valid HMAC signature. The HMAC signature is generated using the request body (payload) and a timestamp.

Headers required for HMAC authentication:

- `x-signature`: The HMAC signature calculated using the secret (`HMAC_SECRET`) and the payload.
- `x-timestamp`: A UNIX timestamp that is included in the HMAC generation process.


## API Endpoints

### Read Request

**Endpoint**: `POST /read`

**Description**: This endpoint allows you to evaluate chaincode functions that query the ledger.

**Request Body**:
```json
{
  "functionName": "ReadAsset",
  "args": ["asset1"]
}
```

**Request Body**:
```json
{
  "functionName": "CreateAsset",
  "args": ["assetId", "color", "size", "owner", "appraisedValue"]
}
```

**Example cURL Request for Read**:
```bash
curl -X POST http://localhost:3000/read \
-H "Content-Type: application/json" \
-H "x-api-key: your_default_api_key" \
-H "x-signature: <calculated-signature>" \
-H "x-timestamp: <timestamp>" \
-d '{
  "functionName": "ReadAsset",
  "args": ["asset1"]
}'
```

### In this example:

- The request reads the asset with the ID `asset1`.
- Replace `<calculated-signature>` with the HMAC signature generated by your application.
- Replace `<timestamp>` with the current UNIX timestamp.


### Write Request

To write data to the ledger, such as creating a new asset, use the `/write` endpoint. Below is an example of a cURL request to invoke the `CreateAsset` function:

**Example cURL Request for Write**:
```bash
curl -X POST http://localhost:3000/write \
-H "Content-Type: application/json" \
-H "x-api-key: your_default_api_key" \
-H "x-signature: <calculated-signature>" \
-H "x-timestamp: <timestamp>" \
-d '{
  "functionName": "CreateAsset",
  "args": ["asset2", "blue", "10", "Alice", "5000"]
}'
```

### In this example:

- The request creates a new asset with ID `asset2`, color `blue`, size `10`, owned by `Alice`, and appraised at a value of `5000`.
- Replace `<calculated-signature>` with the HMAC signature generated by your application using the payload and timestamp.
- Replace `<timestamp>` with the current UNIX timestamp.

### Error Handling

- **401 Unauthorized**: This error occurs when the API key or HMAC signature is invalid or missing.
- **500 Internal Server Error**: This error occurs when there’s an issue with the chaincode or the Fabric network.

## Scripts for API Calls

To streamline making API requests to the DLT Service, we have created two shell scripts: `read_asset.sh` for reading assets from the ledger and `create_asset.sh` for creating new assets on the ledger. These scripts automatically handle the generation of HMAC signatures and execution of the respective cURL commands.

### 1. `read_asset.sh`

This script reads an asset from the ledger by invoking the `ReadAsset` chaincode function.

```bash
#!/bin/bash

# Define the HMAC secret, payload, and timestamp
HMAC_SECRET="your_default_hmac_secret"
TIMESTAMP=$(date +%s)

# Serialize the payload to ensure consistent formatting
PAYLOAD=$(echo -n '{"functionName": "ReadAsset", "args": ["asset1"]}' | jq -c .)

# Generate HMAC signature using the payload and timestamp
SIGNATURE=$(echo -n "$PAYLOAD$TIMESTAMP" | openssl dgst -sha256 -hmac "$HMAC_SECRET" | sed 's/^.* //')

# Debugging - print out the variables to verify
echo "Client Payload: $PAYLOAD"
echo "Client Timestamp: $TIMESTAMP"
echo "Client Signature: $SIGNATURE"
echo "Client HMAC_SECRET: $HMAC_SECRET"

# Execute the cURL command
curl -X POST http://localhost:3000/read \
-H "Content-Type: application/json" \
-H "x-api-key: your_default_api_key" \
-H "x-signature: $SIGNATURE" \
-H "x-timestamp: $TIMESTAMP" \
-d "$PAYLOAD"
```

#### How to Run:

1. **Save the script** as `read_asset.sh`.
2. **Give the script execute permissions** by running the following command:
  ```bash
   chmod +x read_asset.sh
  ```
3. **Run the script:**:
  ```bash
  ./read_asset.sh
  ```
  This script generates an HMAC signature using the payload and timestamp and sends a POST request to the /read endpoint to retrieve asset details from the ledger.

### 2. `create_asset.sh`

This script creates a new asset on the ledger by invoking the `CreateAsset` chaincode function.

```bash
#!/bin/bash

# Define the HMAC secret, payload, and timestamp
HMAC_SECRET="your_default_hmac_secret"
TIMESTAMP=$(date +%s)

# Define the payload for creating a new asset
# Example asset with ID, Color, Size, Owner, and AppraisedValue
PAYLOAD=$(echo -n '{
    "functionName": "CreateAsset",
    "args": ["asset26", "blue", "10", "Alice", "5000"]
}' | jq -c .)

# Generate HMAC signature using the payload and timestamp
SIGNATURE=$(echo -n "$PAYLOAD$TIMESTAMP" | openssl dgst -sha256 -hmac "$HMAC_SECRET" | sed 's/^.* //')

# Debugging - print out the variables to verify
echo "Client Payload: $PAYLOAD"
echo "Client Timestamp: $TIMESTAMP"
echo "Client Signature: $SIGNATURE"
echo "Client HMAC_SECRET: $HMAC_SECRET"

# Execute the cURL command for write operation (create asset)
curl -X POST http://localhost:3000/write \
-H "Content-Type: application/json" \
-H "x-api-key: your_default_api_key" \
-H "x-signature: $SIGNATURE" \
-H "x-timestamp: $TIMESTAMP" \
-d "$PAYLOAD"
```

#### How to Run:

1. **Save the script** as `read_asset.sh`.
2. **Give the script execute permissions** by running the following command:
  ```bash
   chmod +x read_asset.sh
  ```
3. **Run the script:**:
  ```bash
  ./read_asset.sh
  ```
    This script generates an HMAC signature using the payload and timestamp and sends a POST request to the /read endpoint to retrieve asset details from the ledger.

  
### Conclusion

This DLT Service API allows secure and controlled access to the chaincode functions deployed on a Hyperledger Fabric network. By using API key authentication and HMAC signature verification, the service ensures that only authorized requests can query or modify the ledger.

For further inquiries or issues, please raise them in the issue tracker.