import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { ConfigController } from '../controllers/config';

const router = Router();

router.get('/test', authenticateToken(), ConfigController.test);
router.get('/getConfig', authenticateToken(), ConfigController.getConfig);

export default router;