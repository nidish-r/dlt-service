import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { connect, signers } from '@hyperledger/fabric-gateway';
import grpc from '@grpc/grpc-js';
import { config } from '../config/index.js';
import { TextDecoder } from 'util';

const utf8Decoder = new TextDecoder();

// Helper function to get the first file in a directory
const getFirstDirFileName = async (dirPath) => {
    const files = await fs.readdir(dirPath);
    if (files.length === 0) {
        throw new Error(`No files found in directory: ${dirPath}`);
    }
    
    const firstFile = files[0];
    
    if (!firstFile) {
        throw new Error(`No valid file found in directory: ${dirPath}`);
    }
    
    return path.join(dirPath, firstFile); // Return the first file
};

const newGrpcConnection = async () => {
    const caCertPath = path.resolve(config.cryptoPath, 'peers', 'peer0.org1.example.com', 'tls', 'ca.crt');
    const tlsRootCert = await fs.readFile(caCertPath);
    const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
    return new grpc.Client(config.peerEndpoint, tlsCredentials, {
        'grpc.ssl_target_name_override': config.peerHostAlias,
    });
};

const newIdentity = async () => {
    const certDirPath = path.resolve(config.cryptoPath, 'users', 'User1@org1.example.com', 'msp', 'signcerts');
    const certPath = await getFirstDirFileName(certDirPath);
    const credentials = await fs.readFile(certPath);
    return { mspId: config.mspId, credentials };
};

const newSigner = async () => {
    const keyDirPath = path.resolve(config.cryptoPath, 'users', 'User1@org1.example.com', 'msp', 'keystore');
    const keyPath = await getFirstDirFileName(keyDirPath);
    const privateKeyPem = await fs.readFile(keyPath);
    const privateKey = crypto.createPrivateKey(privateKeyPem);
    return signers.newPrivateKeySigner(privateKey);
};

export const baseChaincodeService = {
    read: async (functionName, args) => {
        const client = await newGrpcConnection();
        const gateway = connect({
            client,
            identity: await newIdentity(),
            signer: await newSigner(),
        });
        const network = gateway.getNetwork(config.channelName);
        const contract = network.getContract(config.chaincodeName);

        const resultBytes = await contract.evaluateTransaction(functionName, ...args);
        const result = JSON.parse(utf8Decoder.decode(resultBytes));

        return result;
    },

    write: async (functionName, args) => {
        const client = await newGrpcConnection();
        const gateway = connect({
            client,
            identity: await newIdentity(),
            signer: await newSigner(),
        });
        const network = gateway.getNetwork(config.channelName);
        const contract = network.getContract(config.chaincodeName);

        await contract.submitTransaction(functionName, ...args);
    }
};
