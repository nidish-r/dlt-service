import express from 'express';

export const createChaincodeRouter = (authMiddleware: any, controller: any) => {
    const chaincodeRouter = express.Router();

    // Chaincode read route (protected by API key and HMAC authentication)
    chaincodeRouter.post('/read', authMiddleware.apiKeyAuth, authMiddleware.hmacAuth, controller.read);

    // Chaincode write route (protected by API key and HMAC authentication)
    chaincodeRouter.post('/write', authMiddleware.apiKeyAuth, authMiddleware.hmacAuth, controller.write);

    return chaincodeRouter;
};
