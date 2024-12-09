import { chaincodeService } from '../services/v1/chaincodeService.js';

export const baseChaincodeController = {
    read: async (req, res) => {
        // Extract functionName and args from the request body
        const { functionName, args } = req.body;

        try {
            // Call the chaincode service's read function
            const result = await chaincodeService.read(functionName, args);

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

    write: async (req, res) => {
        // Extract functionName and args from the request body
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
