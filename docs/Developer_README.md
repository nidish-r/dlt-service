# DLT Service API Documentation

This documentation provides a detailed guide for setting up and using the Distributed Ledger Technology (DLT) Service API, built with Node.js, Hyperledger Fabric, and PostgreSQL. This implementation includes API key authentication and HMAC signature verification for secure transaction and chaincode interactions on a Hyperledger Fabric network.

## Table of Contents

- [Overview](#overview)
- [System Requirements](#system-requirements)
- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [v1 API Endpoints](#v1-api-endpoints)
  - [Authentication](#authentication)
    - [API Key Authentication](#api-key-authentication)
    - [HMAC Authentication](#hmac-authentication)
  - [API Endpoints](#api-endpoints)
    - [Read Request](#read-request)
    - [Write Request](#write-request)
    - [Scripts for API Calls](#scripts-for-api-calls)
- [v2 API Endpoints](#v2-api-endpoints)
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

## DLT Service Setup

1. Clone the repository to your local machine:
    ```bash
    git clone <repository-url>
    cd <repository-folder>
    ```

2. Install the dependencies:
    ```bash
    npm install
    ```

3. Configure the `/config/index.ts` file with the required environment variables (see [Environment Variables](#environment-variables)).

4. Start the application:
    ```bash
    npm start
    ```

The DLT service will be running at `http://localhost:3000`.

## Hyperledger Fabric Setup (not required)

Although this setup is optional for running the DLT service, if you want to integrate with Hyperledger Fabric, follow these steps:

### Step 1: Clone the Hyperledger Fabric Samples Repository

Download the `fabric-samples` repository, which contains the necessary artifacts to set up the Hyperledger Fabric test network.

```bash
git clone https://github.com/hyperledger/fabric-samples.git
```

### Step 2: Start the Test Network

Navigate to the `test-network` directory within the `fabric-samples` and bring up the Hyperledger Fabric network. This will create a local network with peers, an orderer, and CA nodes, which will be required for running the DLT service.

```bash
cd fabric-samples/test-network
./network.sh up createChannel -ca
```

### Verifying the Setup

To verify that the Hyperledger Fabric network is running, you can check the status of Docker containers by running the following command:

```bash
docker ps
```

### Example Output of `docker ps`

When you run the `docker ps` command, you should see Docker containers running for:

- Peers from `Org1` and `Org2`
- The orderer service
- Certificate Authorities (CAs) for `Org1` and `Org2`

Here's an example output of the `docker ps` command:

```bash
CONTAINER ID   IMAGE                            COMMAND             CREATED          STATUS          PORTS                              NAMES
a1234bcd567e   hyperledger/fabric-peer          "peer node start"   10 seconds ago   Up 9 seconds    0.0.0.0:7051->7051/tcp             peer0.org1.example.com
b9876cde543f   hyperledger/fabric-orderer       "orderer"           15 seconds ago   Up 13 seconds   0.0.0.0:7050->7050/tcp             orderer.example.com
c7654fgh321z   hyperledger/fabric-ca            "fabric-ca-server"  20 seconds ago   Up 18 seconds   0.0.0.0:7054->7054/tcp             ca.org1.example.com
d5432fed0981   hyperledger/fabric-peer          "peer node start"   10 seconds ago   Up 9 seconds    0.0.0.0:8051->7051/tcp             peer0.org2.example.com
e6789xyz1234   hyperledger/fabric-ca            "fabric-ca-server"  20 seconds ago   Up 18 seconds   0.0.0.0:8054->7054/tcp             ca.org2.example.com
```

### Step 3: Deploy Smart Contracts (Chaincode)

Once the Hyperledger Fabric network is running, you can proceed to deploy your smart contracts (referred to as chaincode).

1. **Package the chaincode**:
   You will need to package your chaincode before installing it on the peers. Use the following command:

   ```bash
   ./network.sh deployCC -ccn mychaincode -ccp ../chaincode/ -ccl go
   ```

### Step 4: Adjusting Crypto Material Paths

For the DLT service to communicate correctly with your Hyperledger Fabric network, you need to configure the path to the crypto materials (certificates and keys). These crypto materials are generated by Hyperledger Fabric and stored within the `fabric-samples` directory, specifically within the `test-network` setup. For easier access, you'll want to move these materials to a location inside your project and adjust the path accordingly.

#### Copy the Crypto Materials

1. **Copy the crypto materials** from the `fabric-samples` directory to a more accessible location within your project (e.g., an `organizations` folder at the root of your project). Run the following command:

    ```bash
    cp -r ../fabric-samples/test-network/organizations ~/your-project-root/organizations
    ```

    This will copy all necessary certificates, keys, and configuration files for Org1 and Org2 from the `fabric-samples` directory to a local `organizations` folder in your project.

#### Update the `cryptoPath` in the Application

2. **Modify the cryptoPath** in your DLT service configuration to point to the new location where the crypto materials have been stored. Update this path in your configuration file (e.g., `/config/index.ts`) as shown below:

    ```typescript
    cryptoPath: process.env.CRYPTO_PATH || path.resolve(__dirname, '../../organizations/peerOrganizations/org1.example.com'),
    ```

    This ensures that your DLT service can access the necessary crypto materials to interact with the Hyperledger Fabric network.

#### Verifying the Path

3. **Ensure the `cryptoPath` is set correctly** by checking the file structure in the `organizations` directory. It should look something like this:

    ```bash
    organizations/
    ├── peerOrganizations/
    │   ├── org1.example.com/
    │   │   ├── ca/
    │   │   ├── msp/
    │   │   ├── peers/
    │   │   ├── users/
    │   └── org2.example.com/
    │       ├── ca/
    │       ├── msp/
    │       ├── peers/
    │       ├── users/
    └── ordererOrganizations/
        └── example.com/
            ├── ca/
            ├── msp/
            ├── orderers/
            ├── users/
    ```

#### Testing the Setup

4. **Test your DLT service** by starting it again after updating the `cryptoPath` and interacting with the Fabric network (e.g., by querying installed chaincode or invoking a transaction). If everything is set up correctly, the service should have no issues accessing the crypto materials and communicating with the network.

This step is crucial for ensuring that the application can securely interact with the blockchain network using the correct certificates and keys.

## Environment Variables

The service requires several environment variables to function correctly. These variables are defined in a `/config/index.ts` file located at the project root.

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
CRYPTO_PATH=/path/to/crypto/materials/
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


# v1 API Endpoints

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
curl -X POST http://localhost:3000/v1/read \
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
curl -X POST http://localhost:3000/v1/write \
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

This script reads an asset on the ledger by invoking the `ReadAsset` chaincode function.

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

# v2 API Endpoints (WIP)

The **v2 API Endpoints** offer an enhanced level of security and flexibility compared to the v1 version. In addition to the basic functionality for reading and writing chaincode on a Hyperledger Fabric network, v2 introduces the following key features:

1. **API Key Generation and Rotation**: 
   - The v2 API allows the creation and rotation of API keys dynamically, ensuring better security management. Users can generate their first API key via an unprotected endpoint. Subsequent key rotations must be done through a secure endpoint protected by both API key and HMAC authentication.

2. **HMAC Authentication**: 
   - Similar to v1, v2 continues to utilize HMAC-SHA256 signatures to verify the integrity of API requests. However, the secret used to generate these signatures can now be rotated alongside the API key.

3. **Granular Access Control**: 
   - v2 lays the foundation for implementing more granular access control mechanisms, such as assigning specific permissions or roles to API keys in future versions.

### Conclusion

This DLT Service API allows secure and controlled access to the chaincode functions deployed on a Hyperledger Fabric network. By using API key authentication and HMAC signature verification, the service ensures that only authorized requests can query or modify the ledger.