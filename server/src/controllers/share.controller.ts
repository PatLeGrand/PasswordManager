import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.middleware'
import { decrypt } from '../lib/crypto'

import crypto from 'crypto'
import prisma from "../lib/prisma";

export async function shareService(req: AuthRequest, res: Response) {
    const { id } = req.params
    const { email } = req.body

    const service = await prisma.service.findFirst({
        where: { id: id as string, userId: req.userId as string }
    })



    if (!service) {
        res.status(404).json({ message: 'Service introuvable' })
        return
    }

    const token = crypto.randomBytes(32).toString('hex')
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await prisma.sharedPassword.create({
        data: {
            tokenHash,
            serviceId: id as string,
            createdBy: req.userId as string,
            expiresAt,
        }
    })

    const link = `${process.env.CLIENT_URL}/share/${token}`

    // TODO: await sendShareEmail(email, link, service.name)
    // TODO: await sendShareNotification(req.userEmail!, email, service.name)

    console.log('Lien de partage généré:', link)

    res.json({ message: 'Lien de partage envoyé', link })
}

export async function getSharedService(req: AuthRequest, res: Response) {
    const token = req.params.token as string

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

    const shared = await prisma.sharedPassword.findFirst({
        where: { tokenHash },
    })

    if (!shared) {
        res.status(404).json({ message: 'Lien invalide' })
        return
    }

    if (shared.usedAt) {
        res.status(410).json({ message: 'Lien déjà utilisé' })
        return
    }

    if (shared.expiresAt < new Date()) {
        res.status(410).json({ message: 'Lien expiré' })
        return
    }

    const service = await prisma.service.findUnique({
        where: { id: shared.serviceId }
    })

    if (!service) {
        res.status(404).json({ message: 'Service introuvable' })
        return
    }

    await prisma.sharedPassword.update({
        where: { id: shared.id },
        data: { usedAt: new Date() }
    })

    res.json({
        name: service.name,
        username: service.username,
        password: decrypt(service.password),
        url: service.url,
    })
}