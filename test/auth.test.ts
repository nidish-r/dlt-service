import { apiKeyAuth, hmacAuth } from '../src/middlewares/v1/auth'; // Update paths as needed
import { config } from '../src/config'; // Ensure correct path
import { Request, Response, NextFunction } from 'express'; // Import necessary types from express
import * as crypto from 'crypto';

describe('Auth Middleware', () => {
  let req: Partial<Request>, res: Partial<Response>, next: NextFunction;

  beforeEach(() => {
    req = {
      headers: {},
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn(); // Mock the next function
  });

  describe('apiKeyAuth', () => {
    test('should call next if API key is valid', () => {
      req.headers!['x-api-key'] = config.API_KEY;

      apiKeyAuth(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
    });

    test('should return 401 if API key is missing', () => {
      apiKeyAuth(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized: Missing API Key' });
    });

    test('should return 401 if API key is invalid', () => {
      req.headers!['x-api-key'] = 'wrong_key';

      apiKeyAuth(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized: Invalid API Key' });
    });
  });

  describe('hmacAuth', () => {
    test('should call next if signature is valid', () => {
      req.headers!['x-api-key'] = config.API_KEY;
      req.headers!['x-signature'] = 'correct_signature';
      req.headers!['x-timestamp'] = Date.now().toString();
      req.body = { data: 'test' };

      const hmac = crypto.createHmac('sha256', config.HMAC_SECRET);
      const payload = JSON.stringify(req.body);
      hmac.update(payload + req.headers!['x-timestamp']);
      const validSignature = hmac.digest('hex');

      req.headers!['x-signature'] = validSignature;

      hmacAuth(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
    });

    test('should return 401 if signature is missing', () => {
      hmacAuth(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Missing authentication headers' });
    });

    test('should return 401 if signature is invalid', () => {
      req.headers!['x-api-key'] = config.API_KEY;
      req.headers!['x-signature'] = 'wrong_signature';
      req.headers!['x-timestamp'] = Date.now().toString();
      req.body = { data: 'test' };

      hmacAuth(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized: Invalid signature' });
    });
  });
});
