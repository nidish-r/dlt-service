import express from 'express';
import { config } from './config/index.js';
import v1ChaincodeRouter from './routes/v1/chaincodeRouter.js';
import v2AuthRouter from './routes/v2/authRouter.js';
import v2ChaincodeRouter from './routes/v2/chaincodeRouter.js';

const app = express();

app.use(express.json());

app.use('/v1/chaincode', v1ChaincodeRouter); // v1 Chaincode routes

app.use('/v2/auth', v2AuthRouter);           // v2 Authentication routes
app.use('/v2/chaincode', v2ChaincodeRouter); // v2 Chaincode routes

app.listen(config.PORT, () => {
    console.log(`DLT Service is running on port ${String(config.PORT)}`);
});