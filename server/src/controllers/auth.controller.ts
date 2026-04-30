import { Request, Response } from 'express'
import nodemailer from 'nodemailer'
import prisma from '../lib/prisma'
import bcrypt from 'bcrypt'
import crypto from "crypto";
import jwt from 'jsonwebtoken'

const JWT_SECRET =process.env.JWT_SECRET || 'changez_moi'



export async function signup(req: Request, res: Response) {
    // Ethereal
    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    })

    try {
        const {email, firstName, lastName, password} = req.body

        const existing = await prisma.user.findUnique({where: {email}})
        if (existing && existing.emailVerified) {
            res.status(400).json({message: 'Email déja utilisé'})
            return
        }
        //hash de mdp
        const hashedPassword = await bcrypt.hash(password, 12)

        const verifyToken = crypto.randomBytes(32).toString('hex')

        const user = await prisma.user.upsert({
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

        //Email de vérification
        await transporter.sendMail({
            from: '"Password Manager" <no-reply@pm.com>',
            to: email,
            subject: 'Vérifier votre email',
            html: `<p>Bonjour ${firstName},</p>
                   <p>Cliquez sur ce lien pour vérifier votre compte :</p>
                   <a href="http://localhost:3000/api/auth/verify/${verifyToken}">Vérifier mon email</a>`,
        })

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
export async function login(req: Request, res: Response) {
    try {
        const {email, password} = req.body

        const user = await prisma.user.findUnique({where: {email}})
        if (!user) {
            res.status(401).json({message: 'Email ou mot de passe incorrect'})
            return
        }

        if(!user.emailVerified) {
            res.status(401).json({message: 'Veuillez vérifier votre email'})
            return
        }

        const validPassword = await bcrypt.compare(password, user.password)
        if (!validPassword) {
            res.status(401).json({message: 'Email ou mot de passe incorrect'})
            return
        }

        // Générer le JWT
        const token = jwt.sign(
            {userId: user.id, email: user.email},
            JWT_SECRET,
            { expiresIn: '7d' },
        )

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
        res.status(500).json({message: 'Erreur serveur'})
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































