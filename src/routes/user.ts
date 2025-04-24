import { Router } from 'express';
import { UserController } from '../controllers/user';
import { validateRequest } from '../middleware/validate';
import { signupSchema, loginSchema, resetPasswordSchema, forgotPasswordSchema, editSchema } from '../validators/user';
import { authenticateToken } from '../middleware/auth';

/**
 * Initializes a new Router instance.
 * This router will be used to define user-related routes.
 */
const router = Router();

router.post('/signup', validateRequest(signupSchema), UserController.signup);
router.post('/login', validateRequest(loginSchema), UserController.login);
router.post('/reauth', UserController.reauth);
router.get('/verify-email/:token', UserController.verifyEmail);
router.post('/forgot-password', validateRequest(forgotPasswordSchema), UserController.forgotPassword);
router.post('/reset-password/:token', validateRequest(resetPasswordSchema), UserController.resetPassword);
router.post('/edit', authenticateToken(), validateRequest(editSchema), UserController.edit);
router.post('/addTwitch', authenticateToken(), UserController.addTwitch);

export default router;