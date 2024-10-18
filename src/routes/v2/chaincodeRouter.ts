import { createChaincodeRouter } from '../baseChaincodeRouter';
import { chaincodeController } from '../../controllers/v2/chaincodeController';
import * as authMiddleware from '../../middlewares/v2/auth';

const chaincodeRouter = createChaincodeRouter(authMiddleware, chaincodeController);

export default chaincodeRouter;
