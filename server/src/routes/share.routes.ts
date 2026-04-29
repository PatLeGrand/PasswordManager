import { Router } from 'express'
import { shareService, getSharedService } from '../controllers/share.controller'
import { authenticate } from '../middleware/auth.middleware'

const router = Router()

router.post('/:id/share', authenticate, shareService)
router.get('/:token', getSharedService)

export default router