import { Request, Response, NextFunction } from 'express';
import { config } from '../config/index';
import { getApiKeyAndSecret } from '../services/apiKeyService';
import * as crypto from 'crypto';

// API Key Authentication Middleware
export const apiKeyAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
        res.status(401).json({ message: 'Unauthorized: Missing API Key' });
        return;
    }

    const storedApiKey = await getApiKeyAndSecret(apiKey);
    
    if (storedApiKey) {
        next(); // API Key is valid, proceed to the next middleware
    } else {
        res.status(401).json({ message: 'Unauthorized: Invalid API Key' });
    }
};

export const hmacAuth = (req: Request, res: Response, next: NextFunction): void => {
    const signature = req.headers['x-signature'] as string;
    const timestamp = req.headers['x-timestamp'] as string;
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