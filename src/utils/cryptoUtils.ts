import crypto from 'crypto';

// Function to create HMAC Signature
export const createHMACSignature = (payload: string, secret: string, timestamp: string): string => {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payload + timestamp);
    return hmac.digest('hex');
};

// Function to generate a random API Key
export const generateApiKey = (): string => {
    return crypto.randomBytes(32).toString('hex'); // 64-character hex string
};

// Function to generate a random HMAC Secret
export const generateHmacSecret = (): string => {
    return crypto.randomBytes(64).toString('hex'); // 128-character hex string
};
