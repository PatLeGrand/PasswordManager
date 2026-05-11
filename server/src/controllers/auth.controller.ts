import { Request, Response } from 'express'
import prisma from '../lib/prisma'
import { sendVerificationEmail, sendOtpEmail } from '../services/email.service'
import bcrypt from 'bcrypt'
import crypto from "crypto";
import jwt from 'jsonwebtoken'
import QRCode from 'qrcode'
import { UAParser } from 'ua-parser-js'

const { authenticator } = require('otplib')

const JWT_SECRET =process.env.JWT_SECRET || 'changez_moi'


export async function signup(req: Request, res: Response) {
    try {
        const {email, firstName, lastName, password} = req.body

        const existing = await prisma.user.findUnique({where: {email}})
        if (existing && existing.emailVerified) {
            res.status(400).json({message: 'Email déja utilisé'})
            return
        }

        const hashedPassword = await bcrypt.hash(password, 12)
        const verifyToken = crypto.randomBytes(32).toString('hex')

        await prisma.user.upsert({
            where: { email },
            update: {
                firstName,
                lastName,
                password: hashedPassword,
                verifyToken,
                emailVerified: false,
            },
            create: {
                email,
                firstName,
                lastName,
                password: hashedPassword,
                verifyToken,
            },
        })

        await sendVerificationEmail(email, firstName, verifyToken)

        res.status(201).json({message: 'Compte crée, vérifier votre email'})
    } catch (error) {
        console.log(error)
        res.status(500).json({message: 'Erreur serveur'})
    }
}

// GET /api/auth/verify/:token
export async function verifyEmail(req: Request, res: Response) {
    try {
        const token = req.params.token as string
        const user =  await prisma.user.findFirst({where: {verifyToken: token}})
        if (!user) {
            res.status(400).json({message: 'Token invalide'})
            return
        }
        await prisma.user.update({
            where: {id: user.id},
            data: {
                emailVerified: true,
                verifyToken: null,
            },
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({message: 'Erreur serveur'})
    }

    res.json({message: 'Email vérifié avec succès'})
}

// POST /api/auth/login
// POST /api/auth/login
export async function login(req: Request, res: Response) {
    try {
        const { email, password } = req.body

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) {
            res.status(401).json({ message: 'Email ou mot de passe incorrect' })
            return
        }

        if (!user.emailVerified) {
            res.status(401).json({ message: 'Veuillez vérifier votre email' })
            return
        }

        const validPassword = await bcrypt.compare(password, user.password)
        if (!validPassword) {
            res.status(401).json({ message: 'Email ou mot de passe incorrect' })
            return
        }

        // Construire la liste des méthodes MFA disponibles
        const methods: string[] = []
        if (user.mfaEmail) methods.push('email')
        if (user.totpEnabled) methods.push('totp')

        if (methods.length > 0) {
            // Si MFA email disponible, on génère et envoie le code maintenant
            if (user.mfaEmail) {
                const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
                const otpExpires = new Date(Date.now() + 10 * 60 * 1000)

                await prisma.user.update({
                    where: { id: user.id },
                    data: { otpCode, otpExpires },
                })

                await sendOtpEmail(email, user.firstName, otpCode)
            }

            // Retourner les méthodes disponibles → le frontend affiche le choix
            res.json({ mfaRequired: true, email, methods })
            return
        }

        // Aucun MFA → JWT direct
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' },
        )

        const forwarded = req.headers['x-forwarded-for']
        const ip = (Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0]) ?? req.socket.remoteAddress ?? 'Inconnue'
        const parser = new UAParser(req.headers['user-agent'] || '')
        const ua = parser.getResult()
        const device = `${ua.browser.name ?? 'Inconnu'} sur ${ua.os.name ?? 'OS inconnu'}`

        await prisma.session.create({
            data: { userId: user.id, token, ip, device },
        })

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            },
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Erreur serveur' })
    }
}

// POST /api/auth/change-password
export async function changePassword(req: Request, res: Response) {
    try {
        const userId = (req as any).userId
        const { currentPassword, newPassword } = req.body

        const user = await prisma.user.findUnique({ where: { id: userId } })
        if (!user) {
            res.status(404).json({ message: 'Utilisateur introuvable' })
            return
        }

        const valid = await bcrypt.compare(currentPassword, user.password)
        if (!valid) {
            res.status(401).json({ message: 'Mot de passe actuel incorrect' })
            return
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12)

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        })

        res.json({ message: 'Mot de passe mis à jour avec succès' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Erreur serveur' })
    }
}

// POST /api/auth/mfa/email
export async function toggleMfaEmail(req: Request, res: Response) {
    try {
        const userId = (req as any).userId
        const { enabled } = req.body

        await prisma.user.update({
            where: { id: userId },
            data: { mfaEmail: enabled },
        })

        res.json({ message: 'MFA Email mis à jour', mfaEmail: enabled })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Erreur serveur' })
    }
}

// GET /api/auth/me
export async function getMe(req: Request, res: Response) {
    try {
        const userId = (req as any).userId

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                mfaEmail: true,
                totpEnabled: true,
                createdAt: true,
            },
        })

        if (!user) {
            res.status(404).json({ message: 'Utilisateur introuvable' })
            return
        }

        res.json(user)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Erreur serveur' })
    }
}

// PUT /api/auth/profile
export async function updateProfile(req: Request, res: Response) {
    try {
        const userId = (req as any).userId
        const { firstName, lastName } = req.body

        if (!firstName?.trim() || !lastName?.trim()) {
            res.status(400).json({ message: 'Prénom et nom requis' })
            return
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: { firstName: firstName.trim(), lastName: lastName.trim() },
            select: { id: true, email: true, firstName: true, lastName: true, createdAt: true },
        })

        res.json(user)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Erreur serveur' })
    }
}

// POST /api/auth/verify-otp
export async function verifyOtp(req: Request, res: Response) {
    try {
        const { email, code } = req.body

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) {
            res.status(404).json({ message: 'Utilisateur introuvable' })
            return
        }

        if (!user.otpCode || !user.otpExpires) {
            res.status(400).json({ message: 'Aucun code OTP demandé' })
            return
        }

        if (new Date() > user.otpExpires) {
            res.status(400).json({ message: 'Code OTP expiré' })
            return
        }

        if (user.otpCode !== code) {
            res.status(401).json({ message: 'Code incorrect' })
            return
        }

        // Code valide → effacer l'OTP et émettre le JWT
        await prisma.user.update({
            where: { id: user.id },
            data: { otpCode: null, otpExpires: null },
        })

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' },
        )

        const forwarded = req.headers['x-forwarded-for']
        const ip = (Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0]) ?? req.socket.remoteAddress ?? 'Inconnue'
        const parser = new UAParser(req.headers['user-agent'] || '')
        const ua = parser.getResult()
        const device = `${ua.browser.name ?? 'Inconnu'} sur ${ua.os.name ?? 'OS inconnu'}`

        console.log('verifyOtp appelé')
        console.log('Tentative création session...')

        await prisma.session.create({
            data: { userId: user.id, token, ip, device },
        })

        console.log('Session créée avec succès !')

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            },
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Erreur serveur' })
    }
}

// GET /api/auth/totp/setup
export async function totpSetup(req: Request, res: Response) {
    try {
        const { generateSecret, generateURI } = require('otplib')
        const userId = (req as any).userId

        const user = await prisma.user.findUnique({ where: { id: userId } })
        if (!user) {
            res.status(404).json({ message: 'Utilisateur introuvable' })
            return
        }

        const secret = generateSecret()

        await prisma.user.update({
            where: { id: userId },
            data: { totpSecret: secret },
        })

        const otpauth = generateURI({
            type: 'totp',
            label: user.email,
            issuer: 'Aether',
            secret,
        })
        const qrCodeUrl = await QRCode.toDataURL(otpauth)

        res.json({ qrCodeUrl })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Erreur serveur' })
    }
}

export async function totpVerify(req: Request, res: Response) {
    try {
        const { verify } = require('otplib')
        const userId = (req as any).userId
        const { code } = req.body

        const user = await prisma.user.findUnique({ where: { id: userId } })
        if (!user || !user.totpSecret) {
            res.status(400).json({ message: 'TOTP non configuré' })
            return
        }

        const valid = verify({ type: 'totp', secret: user.totpSecret, token: code })
        if (!valid) {
            res.status(401).json({ message: 'Code incorrect' })
            return
        }

        await prisma.user.update({
            where: { id: userId },
            data: { totpEnabled: true },
        })

        res.json({ message: 'TOTP activé avec succès' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Erreur serveur' })
    }
}

// POST /api/auth/verify-totp-login
export async function verifyTotpLogin(req: Request, res: Response) {
    try {
        const { verify } = require('otplib')
        const { email, code } = req.body

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user || !user.totpSecret || !user.totpEnabled) {
            res.status(400).json({ message: 'TOTP non configuré' })
            return
        }

        const valid = verify({ type: 'totp', secret: user.totpSecret, token: code })
        if (!valid) {
            res.status(401).json({ message: 'Code incorrect' })
            return
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' },
        )

        const forwarded = req.headers['x-forwarded-for']
        const ip = (Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0]) ?? req.socket.remoteAddress ?? 'Inconnue'
        const parser = new UAParser(req.headers['user-agent'] || '')
        const ua = parser.getResult()
        const device = `${ua.browser.name ?? 'Inconnu'} sur ${ua.os.name ?? 'OS inconnu'}`

        await prisma.session.create({
            data: { userId: user.id, token, ip, device },
        })

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            },
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Erreur serveur' })
    }
}

export async function totpDisable(req: Request, res: Response) {
    try {
        const userId = (req as any).userId
        await prisma.user.update({
            where: { id: userId },
            data: { totpEnabled: false, totpSecret: null },
        })
        res.json({ message: 'TOTP désactivé' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Erreur serveur' })
    }
}

// GET /api/auth/sessions
export async function getSessions(req: Request, res: Response) {
    try {
        const userId = (req as any).userId
        const sessions = await prisma.session.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        })
        res.json(sessions)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Erreur serveur' })
    }
}

// DELETE /api/auth/sessions/:id
export async function revokeSession(req: Request, res: Response) {
    try {
        const userId = (req as any).userId
        const id = String(req.params.id)
        await prisma.session.deleteMany({
            where: { id, userId },
        })
        res.json({ message: 'Session révoquée' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Erreur serveur' })
    }
}

// DELETE /api/auth/account
export async function deleteAccount(req: Request, res: Response) {
    try {
        const userId = (req as any).userId

        await prisma.sharedPassword.deleteMany({
            where: { OR: [{ createdBy: userId }, { service: { userId } }] },
        })
        await prisma.session.deleteMany({ where: { userId } })
        await prisma.service.deleteMany({ where: { userId } })
        await prisma.user.delete({ where: { id: userId } })

        res.json({ message: 'Compte supprimé' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Erreur serveur' })
    }
}

// DELETE /api/auth/sessions (toutes sauf la courante)
export async function revokeAllSessions(req: Request, res: Response) {
    try {
        const userId = (req as any).userId
        const currentToken = req.headers.authorization?.split(' ')[1]
        await prisma.session.deleteMany({
            where: {
                userId,
                NOT: { token: currentToken },
            },
        })
        res.json({ message: 'Toutes les autres sessions révoquées' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Erreur serveur' })
    }
}


