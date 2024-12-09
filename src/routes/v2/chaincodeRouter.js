import { createChaincodeRouter } from '../baseChaincodeRouter.js';
import { chaincodeController } from '../../controllers/v2/chaincodeController.js';
import * as authMiddleware from '../../middlewares/v2/auth.js';

const chaincodeRouter = createChaincodeRouter(authMiddleware, chaincodeController);

export default chaincodeRouter;
