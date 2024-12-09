import { createChaincodeRouter } from '../baseChaincodeRouter.js';
import { chaincodeController } from '../../controllers/v1/chaincodeController.js';
import * as authMiddleware from '../../middlewares/v1/auth.js';

const chaincodeRouter = createChaincodeRouter(authMiddleware, chaincodeController);

export default chaincodeRouter;
