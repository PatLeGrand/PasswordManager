import {Response} from "express";
import {AuthRequest} from "../middleware/auth.middleware";
import prisma from "../lib/prisma";
import { encrypt ,decrypt} from "../lib/crypto";
import { getParam } from '../lib/utils'

export async function getServices(req: AuthRequest, res: Response) {
    try {
        const services = await prisma.service.findMany({
            where: { userId: req.userId },
            orderBy: { createdAt: "desc" }
        })

        const decrypted = services.map(s => ({
            ...s,
            password: decrypt(s.password)
        }))

        res.json(decrypted)
    } catch (error) {
        console.error(error)
        res.status(500).json({message: "Erreur serveur"})
    }
}

export async function getService(req: AuthRequest, res: Response) {
    try {
        const id = getParam(req.params.id);
        const service = await prisma.service.findFirst({
            where: { id, userId: req.userId }
        })

        if(!service) {
            res.status(404).json({ message: "Service introuvable" })
            return
        }

        res.json({ ...service, password: decrypt(service.password)})
    } catch (error) {
        console.error(error)
        res.status(500).json({message: "Erreur serveur"})
    }
}

export async function createService(req: AuthRequest, res: Response) {
    console.log('createService appelé', req.body, req.userId)
    try {
        if (!req.userId) {
            res.status(401).json({ message: "Non autorisé" })
            return
        }
        const { name, url, username, password, notes } = req.body;
        const service = await prisma.service.create({
            data: {
                userId: req.userId,
                name,
                url,
                username,
                password: encrypt(password),
                notes,
            },
        })

        res.status(201).json({ ...service, password})
    } catch (error) {
        console.error(error)
        res.status(500).json({message: "Erreur serveur"})
    }
}

export async function updateService(req: AuthRequest, res: Response) {
    try {
        const id = getParam(req.params.id);
        const { name, url, username, password, notes } = req.body;
        const existing = await prisma.service.findFirst({
            where: { id, userId: req.userId },
        })
         if(!existing) {
             res.status(404).json({ message: "Service introuvable" })
             return
         }

         const service = await prisma.service.update({
             where: { id },
             data: {
                 name,
                 url,
                 username,
                 password: encrypt(password),
                 notes,
             }
         })

        res.json({ ...service, password})
    } catch (error) {
        console.error(error)
        res.status(500).json({message: "Erreur serveur"})
    }
}

export async function deleteService(req: AuthRequest, res: Response) {
    try {
        const id = getParam(req.params.id);
        const existing = await prisma.service.findFirst({
            where: { id, userId: req.userId },
        })
        if (!existing) {
            res.status(404).json({ message: "Service introuvable" })
            return
        }

        await prisma.service.delete({ where:  { id } })

        res.json({ message: "Service supprimé" })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Erreur serveur" })
    }
}