import { Router } from 'express';
import { EngagementController } from '../controllers/engagement';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/test', authenticateToken(), EngagementController.test);
router.post('/startStream', authenticateToken(), EngagementController.startStream);
router.post('/stopStream', authenticateToken(), EngagementController.stopStream);
router.post('/like', authenticateToken(), EngagementController.like);
router.post('/share', authenticateToken(), EngagementController.share);
router.post('/comment', authenticateToken(), EngagementController.comment);

export default router;