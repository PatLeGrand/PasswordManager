import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import prisma from '../lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || "changez_moi"

export interface AuthRequest extends Request {
    userId?: string
    userEmail?: string
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Token manquant' })
        return
    }

    const token = authHeader.split(' ')[1]

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string, email: string }

        const session = await prisma.session.findUnique({
            where: { token },
        })

        if (!session) {
            res.status(401).json({ message: 'Session révoquée' })
            return
        }

        req.userId = decoded.userId
        req.userEmail = decoded.email
        next()
    } catch (error) {
        res.status(401).json({ message: 'Token invalide' })
    }
}