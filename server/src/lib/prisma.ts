import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

const adapter = new PrismaMariaDb({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'password_manager',
    allowPublicKeyRetrieval: true,
    ssl: false,
})

const prisma = new PrismaClient({ adapter })

export default prisma