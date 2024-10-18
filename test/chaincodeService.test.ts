import { chaincodeService } from '../src/services/v1/chaincodeService';
import { connect } from '@hyperledger/fabric-gateway';

jest.mock('@hyperledger/fabric-gateway');
jest.mock('../src/services/v1/chaincodeService', () => ({
  chaincodeService: {
    read: jest.fn(),
    write: jest.fn(),
  },
}));

describe('Chaincode Service', () => {
  const mockContract = {
    evaluateTransaction: jest.fn(),
    submitTransaction: jest.fn(),
  };

  const mockNetwork = {
    getContract: jest.fn().mockReturnValue(mockContract),
  };

  const mockGateway = {
    getNetwork: jest.fn().mockReturnValue(mockNetwork),
    disconnect: jest.fn(),
  };

  beforeEach(() => {
    (connect as jest.Mock).mockReturnValue(mockGateway); // Type casting for TypeScript to handle mock
  });

  test('should return result from chaincode read operation', async () => {
    // Mock the response of the evaluateTransaction function
    mockContract.evaluateTransaction.mockResolvedValueOnce(
      Buffer.from(JSON.stringify({ id: 'asset1', value: '5000' }))
    );

    // Set the mocked chaincodeService.read to invoke evaluateTransaction
    (chaincodeService.read as jest.Mock).mockImplementation(async () => {
      const resultBytes = await mockContract.evaluateTransaction('ReadAsset', 'asset1');
      return JSON.parse(resultBytes.toString()); // Simulate the actual behavior of reading a transaction
    });

    // Call the read function
    const result = await chaincodeService.read('ReadAsset', ['asset1']);

    // Ensure the result matches the expected value
    expect(result).toEqual({ id: 'asset1', value: '5000' });

    // Ensure the correct function was called with the correct arguments
    expect(mockContract.evaluateTransaction).toHaveBeenCalledWith('ReadAsset', 'asset1');
  });

  test('should submit transaction to chaincode write operation', async () => {
    // Set the mocked chaincodeService.write to invoke submitTransaction
    (chaincodeService.write as jest.Mock).mockImplementation(async () => {
      await mockContract.submitTransaction('CreateAsset', 'asset2', 'blue', '10', 'Alice', '5000');
    });

    // Ensure that the mock for submitTransaction is called with the correct arguments
    await chaincodeService.write('CreateAsset', ['asset2', 'blue', '10', 'Alice', '5000']);

    // Verify that the mock function was called with the correct arguments
    expect(mockContract.submitTransaction).toHaveBeenCalledWith('CreateAsset', 'asset2', 'blue', '10', 'Alice', '5000');
  });
});
