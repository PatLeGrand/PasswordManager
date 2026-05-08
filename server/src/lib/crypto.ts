import crypto from 'crypto'


const ALGORITHM = 'aes-256-cbc'
const SECRET_KEY = process.env.CRYPTO_SECRET || 'changez_moi_32_caracteres_minimum'
const KEY = crypto.scryptSync(SECRET_KEY, 'salt', 32)

export function encrypt(text: string): string {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv)
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()])
    return iv.toString('hex') + ':' + encrypted.toString('hex')
}

export function decrypt(text: string): string {
    const [ivHex, encryptedHex] = text.split(':')
    const iv = Buffer.from(ivHex, 'hex')
    const encrypted = Buffer.from(encryptedHex, 'hex')
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv)
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
    return decrypted.toString()
}