import { config } from '../../config/index.js';
import crypto from 'crypto';

// API Key Authentication Middleware
export const apiKeyAuth = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
        res.status(401).json({ message: 'Unauthorized: Missing API Key' });
        return; // Explicit return to stop further execution
    }

    if (apiKey === config.API_KEY) {
        next(); // Move to the next middleware or route handler
    } else {
        res.status(401).json({ message: 'Unauthorized: Invalid API Key' });
    }
};

export const hmacAuth = (req, res, next) => {
    const signature = req.headers['x-signature'];
    const timestamp = req.headers['x-timestamp'];
    const payload = JSON.stringify(req.body);

    // Logging the important values
    console.log(`Server Payload: ${payload}`);
    console.log(`Server Timestamp: ${timestamp}`);
    console.log(`Server HMAC_SECRET: ${config.HMAC_SECRET}`);
    console.log(`Server Signature Received: ${signature}`);

    if (!signature || !timestamp) {
        res.status(401).json({ message: 'Missing authentication headers' });
    } else {
        const hmac = crypto.createHmac('sha256', config.HMAC_SECRET);
        hmac.update(payload + timestamp);
        const serverSignature = hmac.digest('hex');
        
        console.log(`Server Calculated Signature: ${serverSignature}`);

        if (serverSignature === signature) {
            next(); // Signature is valid
        } else {
            res.status(401).json({ message: 'Unauthorized: Invalid signature' });
        }
    }
};
