import {Router} from "express";

import {signup, login, verifyEmail} from "../controllers/auth.controller"

const router= Router();

router.post('/signup', signup)
router.post('/login', login)
router.get('/verify/:token', verifyEmail)

export default router;