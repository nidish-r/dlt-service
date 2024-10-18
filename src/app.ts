import express from 'express';
import { config } from './config/index';
import { chaincodeController } from './controllers/chaincodeController';
import { apiKeyAuth, hmacAuth } from './middlewares/auth';

const app = express();
app.use(express.json());

app.post('/read', apiKeyAuth, hmacAuth, chaincodeController.read);
app.post('/write', apiKeyAuth, hmacAuth, chaincodeController.write);

app.listen(config.PORT, () => {
    console.log(`DLT Service is running on port ${config.PORT}`);
});