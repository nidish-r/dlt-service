import { promises as fs } from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { connect, signers } from '@hyperledger/fabric-gateway';
import * as grpc from '@grpc/grpc-js';
import { config } from '../config/index';
import { TextDecoder } from 'util'; // Re-add the missing import

const utf8Decoder = new TextDecoder(); // Initialize the TextDecoder

// Helper function to get the first file in a directory
const getFirstDirFileName = async (dirPath: string): Promise<string> => {
    const files = await fs.readdir(dirPath);
    if (!files || files.length === 0) {
        throw new Error(`No files found in directory: ${dirPath}`);
    }
    if (!files[0]) {
        throw new Error(`No valid file found in directory: ${dirPath}`);
    }
    return path.join(dirPath, files[0]);  // Return the first file
};

const newGrpcConnection = async () => {
    const caCertPath = path.resolve(config.cryptoPath, 'peers', 'peer0.org1.example.com', 'tls', 'ca.crt');
    console.log(`TLS Cert Path: ${caCertPath}`); // Debugging
    
    const tlsRootCert = await fs.readFile(caCertPath);
    const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
    return new grpc.Client(config.peerEndpoint, tlsCredentials, {
        'grpc.ssl_target_name_override': config.peerHostAlias,
    });
};

const newIdentity = async () => {
    const certDirPath = path.resolve(config.cryptoPath, 'users', 'User1@org1.example.com', 'msp', 'signcerts');
    const certPath = await getFirstDirFileName(certDirPath);
    console.log(`Cert Path: ${certPath}`); // Debugging
    
    const credentials = await fs.readFile(certPath);
    return { mspId: config.mspId, credentials };
};

const newSigner = async () => {
    const keyDirPath = path.resolve(config.cryptoPath, 'users', 'User1@org1.example.com', 'msp', 'keystore');
    const keyPath = await getFirstDirFileName(keyDirPath);
    console.log(`Key Path: ${keyPath}`); // Debugging
    
    const privateKeyPem = await fs.readFile(keyPath);
    const privateKey = crypto.createPrivateKey(privateKeyPem);
    return signers.newPrivateKeySigner(privateKey);
};

export const chaincodeService = {
    read: async (functionName: string, args: string[]) => {
        const client = await newGrpcConnection();
        const gateway = connect({
            client,
            identity: await newIdentity(),
            signer: await newSigner(),
        });
        const network = gateway.getNetwork(config.channelName);
        const contract = network.getContract(config.chaincodeName);

        const resultBytes = await contract.evaluateTransaction(functionName, ...args);
        const result = JSON.parse(utf8Decoder.decode(resultBytes)); // Use utf8Decoder to decode
        return result;
    },
    
    write: async (functionName: string, args: string[]) => {
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
