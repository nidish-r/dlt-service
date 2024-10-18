import { chaincodeController } from '../src/controllers/v1/chaincodeController';
import { chaincodeService } from '../src/services/v1/chaincodeService';

jest.mock('../src/services/v1/chaincodeService', () => ({
  chaincodeService: {
    read: jest.fn(() => Promise.resolve({ id: 'asset1', value: '5000' })), // Mock result
    write: jest.fn(),
  },
}));

describe('Chaincode Controller', () => {
  let req: any, res: any;

  beforeEach(() => {
    req = {
      body: {
        functionName: 'ReadAsset',
        args: ['asset1'],
      },
    };
    res = {
      status: jest.fn().mockReturnThis(), // Chainable function
      json: jest.fn(), // To mock the json response
    };
  });

  test('should return result when read operation is successful', async () => {
    const mockResult = { id: 'asset1', value: '5000' };

    // Ensure the mock returns the expected result
    (chaincodeService.read as jest.Mock).mockResolvedValue(mockResult);

    // Call the controller method
    await chaincodeController.read(req, res);

    // Add debug logs to check what is actually happening
    console.log('res.status calls:', res.status.mock.calls);
    console.log('res.json calls:', res.json.mock.calls);
    console.log('req.body:', req.body);

    // Check that status 200 is returned
    expect(res.status).toHaveBeenCalledWith(200);

    // Check that the JSON response is correct
    expect(res.json).toHaveBeenCalledWith({ success: true, result: mockResult });
  });

  test('should return error when read operation fails', async () => {
    (chaincodeService.read as jest.Mock).mockRejectedValue(new Error('Chaincode read error'));

    await chaincodeController.read(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Read operation failed', error: 'Chaincode read error' });
  });

  test('should return success when write operation is successful', async () => {
    (chaincodeService.write as jest.Mock).mockResolvedValue(undefined);

    await chaincodeController.write(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Transaction submitted successfully' });
  });

  test('should return error when write operation fails', async () => {
    (chaincodeService.write as jest.Mock).mockRejectedValue(new Error('Chaincode write error'));

    await chaincodeController.write(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Write operation failed', error: 'Chaincode write error' });
  });
});
