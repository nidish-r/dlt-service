import express, { RequestHandler } from 'express';
import { Request, Response } from 'express';

// Define the types for authMiddleware
interface AuthMiddleware {
    apiKeyAuth: RequestHandler;
    hmacAuth: RequestHandler;
}

// Define the types for controller (assuming read and write are Express request handlers)
interface ChaincodeController {
    read: (req: Request, res: Response) => void;
    write: (req: Request, res: Response) => void;
}

export const createChaincodeRouter = (authMiddleware: AuthMiddleware, controller: ChaincodeController) => {
    const chaincodeRouter = express.Router();

    // Chaincode read route (protected by API key and HMAC authentication)
    chaincodeRouter.post('/read', authMiddleware.apiKeyAuth, authMiddleware.hmacAuth, controller.read);

    // Chaincode write route (protected by API key and HMAC authentication)
    chaincodeRouter.post('/write', authMiddleware.apiKeyAuth, authMiddleware.hmacAuth, controller.write);

    return chaincodeRouter;
};
