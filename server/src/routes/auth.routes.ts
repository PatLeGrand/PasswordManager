import {Router} from "express";

import {
    signup, login, verifyEmail, changePassword, toggleMfaEmail, getMe, updateProfile, deleteAccount, verifyOtp, totpSetup, totpVerify,
    totpDisable, getSessions, revokeSession, revokeAllSessions, verifyTotpLogin
} from "../controllers/auth.controller"

import {
    getRegistrationOptions, verifyRegistration,
    getAuthenticationOptions, verifyAuthentication,
    getPasskeys, deletePasskey,
} from "../controllers/webauthn.controller"

import { authenticate } from "../middleware/auth.middleware"

const router= Router();

router.post('/signup', signup)
router.post('/login', login)
router.post('/verify-totp-login', verifyTotpLogin)
router.post('/verify-otp', verifyOtp)
router.post('/change-password', authenticate, changePassword)
router.post('/mfa/email', authenticate, toggleMfaEmail)
router.get('/me', authenticate, getMe)
router.put('/profile', authenticate, updateProfile)
router.get('/totp/setup', authenticate, totpSetup)
router.post('/totp/disable', authenticate, totpDisable)
router.post('/totp/verify', authenticate, totpVerify)
router.get('/verify/:token', verifyEmail)

router.get('/sessions', authenticate, getSessions)
router.delete('/sessions/:id', authenticate, revokeSession)
router.delete('/sessions', authenticate, revokeAllSessions)
router.delete('/account', authenticate, deleteAccount)

// WebAuthn — enregistrement (utilisateur connecté)
router.get('/webauthn/register/options',  authenticate, getRegistrationOptions)
router.post('/webauthn/register/verify',  authenticate, verifyRegistration)

// WebAuthn — authentification (utilisateur non connecté)
router.get('/webauthn/authenticate/options',  getAuthenticationOptions)
router.post('/webauthn/authenticate/verify',  verifyAuthentication)

// WebAuthn — gestion des passkeys
router.get('/webauthn/passkeys',       authenticate, getPasskeys)
router.delete('/webauthn/passkeys/:id', authenticate, deletePasskey)

export default router;