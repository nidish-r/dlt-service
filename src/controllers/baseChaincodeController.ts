import { Request, Response } from 'express';
import { chaincodeService } from '../services/v1/chaincodeService';

export const baseChaincodeController = {
    read: async (req: Request, res: Response) => {
        const { functionName, args } = req.body;
        try {
            const result = await chaincodeService.read(functionName, args);
            res.status(200).json({ success: true, result });
        } catch (error) {
            if (error instanceof Error) {
                res.status(500).json({ message: 'Read operation failed', error: error.message });
            } else {
                res.status(500).json({ message: 'Read operation failed', error: 'Unknown error' });
            }
        }
    },

    write: async (req: Request, res: Response) => {
        const { functionName, args } = req.body;
        try {
            await chaincodeService.write(functionName, args);
            res.status(200).json({ success: true, message: 'Transaction submitted successfully' });
        } catch (error) {
            if (error instanceof Error) {
                res.status(500).json({ message: 'Write operation failed', error: error.message });
            } else {
                res.status(500).json({ message: 'Write operation failed', error: 'Unknown error' });
            }
        }
    }
};
