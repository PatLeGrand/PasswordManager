import {Router} from "express";

import { signup, login, verifyEmail, changePassword, toggleMfaEmail, getMe, verifyOtp, totpSetup, totpVerify } from "../controllers/auth.controller"


import { authenticate } from "../middleware/auth.middleware"

const router= Router();

router.post('/signup', signup)
router.post('/login', login)
router.post('/verify-otp', verifyOtp)
router.post('/change-password', authenticate, changePassword)
router.post('/mfa/email', authenticate, toggleMfaEmail)
router.get('/me', authenticate, getMe)
router.get('/totp/setup', authenticate, totpSetup)
router.post('/totp/verify', authenticate, totpVerify)
router.get('/verify/:token', verifyEmail)

export default router;