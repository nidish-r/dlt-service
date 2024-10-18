import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
    API_KEY: process.env.API_KEY || 'your_default_api_key',
    HMAC_SECRET: process.env.HMAC_SECRET || 'your_default_hmac_secret',
    PORT: process.env.PORT || 3000,
    channelName: process.env.CHANNEL_NAME || 'mychannel',
    chaincodeName: process.env.CHAINCODE_NAME || 'basic',
    mspId: process.env.MSP_ID || 'Org1MSP',
    peerEndpoint: process.env.PEER_ENDPOINT || 'localhost:7051',
    peerHostAlias: process.env.PEER_HOST_ALIAS || 'peer0.org1.example.com',
    cryptoPath: process.env.CRYPTO_PATH || path.resolve(__dirname, '../../../fabric-samples/test-network/organizations/peerOrganizations/org1.example.com'),
};