import express from 'express';
import { createApiKey, rotateApiKey } from '../../controllers/v2/authController.js';
import { apiKeyAuth, hmacAuth } from '../../middlewares/v2/auth.js'; // Middleware for authentication

const authRouter = express.Router();

// Unprotected: Endpoint to generate the first API key and HMAC secret
authRouter.post('/generate', async (req, res) => {
    try {
        const { apiKey, hmacSecret } = await createApiKey();
        res.status(200).json({ apiKey, hmacSecret });
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: 'Error generating API key', error: error.message });
        } else {
            res.status(500).json({ message: 'Unknown error occurred' });
        }
    }
});

// Protected: Endpoint to rotate the existing API key and HMAC secret
authRouter.post('/rotate', apiKeyAuth, hmacAuth, async (req, res) => {
    try {
        const { apiKey, hmacSecret } = await rotateApiKey(req.body.apiKey);
        res.status(200).json({ apiKey, hmacSecret });
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: 'Error rotating API key', error: error.message });
        } else {
            res.status(500).json({ message: 'Unknown error occurred' });
        }
    }
});

export default authRouter;
