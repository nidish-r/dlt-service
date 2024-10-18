import crypto from 'crypto';

export const createHMACSignature = (payload: string, secret: string, timestamp: string): string => {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payload + timestamp);
    return hmac.digest('hex');
};