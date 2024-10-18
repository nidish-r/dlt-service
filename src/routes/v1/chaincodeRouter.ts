import { createChaincodeRouter } from '../baseChaincodeRouter';
import { chaincodeController } from '../../controllers/v1/chaincodeController';
import * as authMiddleware from '../../middlewares/v1/auth';

const chaincodeRouter = createChaincodeRouter(authMiddleware, chaincodeController);

export default chaincodeRouter;
