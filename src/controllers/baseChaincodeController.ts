import { Request, Response } from 'express';
import { chaincodeService } from '../services/v1/chaincodeService';

// Define the expected shape of the request body
interface ChaincodeRequestBody {
    functionName: string;
    args: string[];
}

// Use correct type for the read result
interface ChaincodeReadResult {
    id: string;
    value: string;
}

export const baseChaincodeController = {
    read: async (req: Request, res: Response) => {
        // Type assertion to ensure req.body matches the expected structure
        const { functionName, args } = req.body as ChaincodeRequestBody;

        try {
            // First cast result to unknown, then to ChaincodeReadResult
            const result = await chaincodeService.read(functionName, args) as unknown as ChaincodeReadResult;

            // Debug: log the result to ensure it's being returned as expected
            console.log('ChaincodeService.read result:', result);

            // Return the result directly as a response
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
        // Type assertion to ensure req.body matches the expected structure
        const { functionName, args } = req.body as ChaincodeRequestBody;

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
