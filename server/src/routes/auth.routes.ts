import {Router} from "express";

import {signup, login, verifyEmail, changePassword } from "../controllers/auth.controller"
import { authenticate } from "../middleware/auth.middleware"

const router= Router();

router.post('/signup', signup)
router.post('/login', login)
router.get('/verify/:token', verifyEmail)
router.post('/change-password', authenticate, changePassword)

export default router;