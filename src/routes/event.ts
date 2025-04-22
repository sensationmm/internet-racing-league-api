import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { EventController } from '../controllers/event';
import { validateRequest } from '../middleware/validate';
import { eventCreate } from '../validators/event';

const router = Router();

router.get('/test', authenticateToken(), EventController.test);
router.post('/create', authenticateToken(), validateRequest(eventCreate), EventController.create);

export default router;