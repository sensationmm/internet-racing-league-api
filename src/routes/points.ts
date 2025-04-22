import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { PointsController } from '../controllers/points';

const router = Router();

router.get('/test', authenticateToken(), PointsController.test);
router.get('/getMyPoints', authenticateToken(), PointsController.myPoints);
router.get('/generateLeaderboard', PointsController.generateLeaderboard);
router.get('/getLeaderboard', authenticateToken(), PointsController.getLeaderboard);

export default router;