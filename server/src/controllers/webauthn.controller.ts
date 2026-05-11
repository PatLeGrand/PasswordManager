import { Request, Response } from 'express'
import {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse,
} from '@simplewebauthn/server'
import type { AuthenticatorTransportFuture } from '@simplewebauthn/types'
import prisma from '../lib/prisma'
import jwt from 'jsonwebtoken'
import { UAParser } from 'ua-parser-js'

const JWT_SECRET = process.env.JWT_SECRET || 'changez_moi'
const RP_NAME   = 'Aether'
const RP_ID     = process.env.RP_ID  || 'localhost'
const ORIGIN    = process.env.ORIGIN || 'http://localhost:5173'

// Réutilise la même logique de session que auth.controller
async function createSessionAndToken(
    user: { id: string; email: string },
    req: Request
): Promise<string> {
    const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
    )

    const forwarded = req.headers['x-forwarded-for']
    const ip =
        (Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0]) ??
        req.socket.remoteAddress ??
        'Inconnue'

    const parser = new UAParser(req.headers['user-agent'] || '')
    const ua     = parser.getResult()
    const device = `${ua.browser.name ?? 'Inconnu'} sur ${ua.os.name ?? 'OS inconnu'}`

    await prisma.session.create({
        data: { userId: user.id, token, ip, device },
    })

    return token
}

// ─── Enregistrement ───────────────────────────────────────────────────────────

// GET /api/auth/webauthn/register/options
export async function getRegistrationOptions(req: Request, res: Response) {
    try {
        const userId = (req as any).userId

        const user = await prisma.user.findUnique({
            where:   { id: userId },
            include: { passkeys: true },
        })

        if (!user) {
            res.status(404).json({ message: 'Utilisateur introuvable' })
            return
        }

        const options = await generateRegistrationOptions({
            rpName:          RP_NAME,
            rpID:            RP_ID,
            userName:        user.email,
            userDisplayName: `${user.firstName} ${user.lastName}`,
            attestationType: 'none',
            // Empêche d'enregistrer deux fois le même authenticator
            excludeCredentials: user.passkeys.map(p => ({
                id:         p.credentialId,
                transports: p.transports
                    ? (JSON.parse(p.transports) as AuthenticatorTransportFuture[])
                    : [],
            })),
            authenticatorSelection: {
                residentKey:      'preferred',
                userVerification: 'preferred',
            },
        })

        // Stocke le challenge temporairement en DB
        await prisma.user.update({
            where: { id: userId },
            data:  { webAuthnChallenge: options.challenge },
        })

        res.json(options)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Erreur serveur' })
    }
}

// POST /api/auth/webauthn/register/verify
export async function verifyRegistration(req: Request, res: Response) {
    try {
        const userId = (req as any).userId
        const { credential, name } = req.body

        const user = await prisma.user.findUnique({ where: { id: userId } })

        if (!user || !user.webAuthnChallenge) {
            res.status(400).json({ message: 'Challenge introuvable, recommencez' })
            return
        }

        const verification = await verifyRegistrationResponse({
            response:          credential,
            expectedChallenge: user.webAuthnChallenge,
            expectedOrigin:    ORIGIN,
            expectedRPID:      RP_ID,
        })

        if (!verification.verified || !verification.registrationInfo) {
            res.status(400).json({ message: 'Vérification échouée' })
            return
        }

        const { credential: cred, credentialDeviceType, credentialBackedUp } =
            verification.registrationInfo

        await prisma.passkey.create({
            data: {
                userId,
                credentialId: cred.id,
                publicKey:    Buffer.from(cred.publicKey),
                counter:      cred.counter,
                deviceType:   credentialDeviceType,
                backedUp:     credentialBackedUp,
                transports:   credential.response?.transports
                    ? JSON.stringify(credential.response.transports)
                    : null,
                name: name ?? null,
            },
        })

        // Efface le challenge
        await prisma.user.update({
            where: { id: userId },
            data:  { webAuthnChallenge: null },
        })

        res.json({ verified: true })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Erreur serveur' })
    }
}

// ─── Authentification ─────────────────────────────────────────────────────────

// GET /api/auth/webauthn/authenticate/options?email=...
export async function getAuthenticationOptions(req: Request, res: Response) {
    try {
        const email = req.query.email as string

        if (!email) {
            res.status(400).json({ message: 'Email requis' })
            return
        }

        const user = await prisma.user.findUnique({
            where:   { email },
            include: { passkeys: true },
        })

        if (!user) {
            res.status(404).json({ message: 'Utilisateur introuvable' })
            return
        }

        if (user.passkeys.length === 0) {
            res.status(400).json({ message: 'Aucune passkey enregistrée pour cet utilisateur' })
            return
        }

        const options = await generateAuthenticationOptions({
            rpID: RP_ID,
            allowCredentials: user.passkeys.map(p => ({
                id:         p.credentialId,
                transports: p.transports
                    ? (JSON.parse(p.transports) as AuthenticatorTransportFuture[])
                    : [],
            })),
            userVerification: 'preferred',
        })

        await prisma.user.update({
            where: { id: user.id },
            data:  { webAuthnChallenge: options.challenge },
        })

        res.json(options)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Erreur serveur' })
    }
}

// POST /api/auth/webauthn/authenticate/verify
export async function verifyAuthentication(req: Request, res: Response) {
    try {
        const { email, credential } = req.body

        if (!email || !credential) {
            res.status(400).json({ message: 'Email et credential requis' })
            return
        }

        const user = await prisma.user.findUnique({
            where:   { email },
            include: { passkeys: true },
        })

        if (!user || !user.webAuthnChallenge) {
            res.status(400).json({ message: 'Challenge introuvable, recommencez' })
            return
        }

        // Trouve la passkey correspondante par credentialId
        const passkey = user.passkeys.find(p => p.credentialId === credential.id)

        if (!passkey) {
            res.status(400).json({ message: 'Passkey inconnue' })
            return
        }

        const verification = await verifyAuthenticationResponse({
            response:          credential,
            expectedChallenge: user.webAuthnChallenge,
            expectedOrigin:    ORIGIN,
            expectedRPID:      RP_ID,
            credential: {
                id:         passkey.credentialId,
                publicKey:  new Uint8Array(passkey.publicKey), // Buffer → Uint8Array
                counter:    Number(passkey.counter),
                transports: passkey.transports
                    ? (JSON.parse(passkey.transports) as AuthenticatorTransportFuture[])
                    : undefined,
            },
        })

        if (!verification.verified) {
            res.status(401).json({ message: 'Authentification échouée' })
            return
        }

        // Met à jour le counter (protection anti-replay)
        await prisma.passkey.update({
            where: { id: passkey.id },
            data:  { counter: verification.authenticationInfo.newCounter },
        })

        // Efface le challenge
        await prisma.user.update({
            where: { id: user.id },
            data:  { webAuthnChallenge: null },
        })

        const token = await createSessionAndToken(user, req)

        res.json({
            token,
            user: {
                id:        user.id,
                email:     user.email,
                firstName: user.firstName,
                lastName:  user.lastName,
            },
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Erreur serveur' })
    }
}

// ─── Gestion des passkeys ─────────────────────────────────────────────────────

// GET /api/auth/webauthn/passkeys
export async function getPasskeys(req: Request, res: Response) {
    try {
        const userId = (req as any).userId

        const passkeys = await prisma.passkey.findMany({
            where:   { userId },
            select:  {
                id:         true,
                name:       true,
                deviceType: true,
                backedUp:   true,
                createdAt:  true,
            },
            orderBy: { createdAt: 'desc' },
        })

        res.json(passkeys)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Erreur serveur' })
    }
}

// DELETE /api/auth/webauthn/passkeys/:id
export async function deletePasskey(req: Request, res: Response) {
    try {
        const userId = (req as any).userId
        const id     = String(req.params.id)

        // Vérifie que la passkey appartient bien à cet utilisateur
        const passkey = await prisma.passkey.findFirst({
            where: { id, userId },
        })

        if (!passkey) {
            res.status(404).json({ message: 'Passkey introuvable' })
            return
        }

        await prisma.passkey.delete({ where: { id } })

        res.json({ message: 'Passkey supprimée' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Erreur serveur' })
    }
}
