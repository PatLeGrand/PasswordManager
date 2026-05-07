import {Router} from "express";

import { signup, login, verifyEmail, changePassword, toggleMfaEmail, getMe, verifyOtp } from "../controllers/auth.controller"


import { authenticate } from "../middleware/auth.middleware"

const router= Router();

router.post('/signup', signup)
router.post('/login', login)
router.get('/verify/:token', verifyEmail)
router.post('/change-password', authenticate, changePassword)
router.post('/mfa/email', authenticate, toggleMfaEmail)
router.get('/me', authenticate, getMe)
router.post('/verify-otp', verifyOtp)

export default router;