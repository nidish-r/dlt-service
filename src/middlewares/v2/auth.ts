import { Request, Response, NextFunction } from 'express';
import { getApiKeyAndSecret } from '../../services/v2/apiKeyService';
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

// HMAC Authentication Middleware
export const hmacAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const signature = req.headers['x-signature'] as string;
    const timestamp = req.headers['x-timestamp'] as string;
    const apiKey = req.headers['x-api-key'] as string;
    const payload = JSON.stringify(req.body);

    if (!signature || !timestamp || !apiKey) {
        res.status(401).json({ message: 'Missing authentication headers' });
        return;
    }

    // Retrieve the HMAC secret based on the API key
    const storedCredentials = await getApiKeyAndSecret(apiKey);
    if (!storedCredentials) {
        res.status(401).json({ message: 'Unauthorized: Invalid API Key' });
        return;
    }

    const { hmacSecret } = storedCredentials;

    // Validate the timestamp to avoid replay attacks
    const currentTime = Math.floor(Date.now() / 1000);
    if (Math.abs(currentTime - Number(timestamp)) > 300) { // Allow only 5 minutes window
        res.status(401).json({ message: 'Unauthorized: Request expired' });
        return;
    }

    // Generate the server's HMAC signature
    const hmac = crypto.createHmac('sha256', hmacSecret);
    hmac.update(payload + timestamp);
    const serverSignature = hmac.digest('hex');

    if (serverSignature === signature) {
        next(); // Signature is valid
    } else {
        res.status(401).json({ message: 'Unauthorized: Invalid signature' });
    }
};
