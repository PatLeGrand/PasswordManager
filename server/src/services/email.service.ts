import { Resend } from 'resend'

const FROM = '"Aether" <noreply@aether-manager.ca>'

function getResend() {
    return new Resend(process.env.EMAIL_PASS)
}

export async function sendVerificationEmail(to: string, firstName: string, token: string) {
    const domain = process.env.DOMAIN ? `https://${process.env.DOMAIN}` : 'http://localhost:3000'
    await getResend().emails.send({
        from: FROM,
        to,
        subject: 'Vérifier votre email',
        html: `<p>Bonjour ${firstName},</p>
               <p>Cliquez sur ce lien pour vérifier votre compte :</p>
               <a href="${domain}/api/auth/verify/${token}">Vérifier mon email</a>`,
    })
}

export async function sendOtpEmail(to: string, firstName: string, code: string) {
    await getResend().emails.send({
        from: FROM,
        to,
        subject: 'Votre code de connexion',
        html: `<p>Bonjour ${firstName},</p>
               <p>Votre code de connexion est : <strong>${code}</strong></p>
               <p>Il expire dans 10 minutes.</p>`,
    })
}

export async function sendShareEmail(to: string, link: string, serviceName: string) {
    await getResend().emails.send({
        from: FROM,
        to,
        subject: `Un mot de passe a été partagé avec vous`,
        html: `
      <p>Bonjour,</p>
      <p>Un mot de passe pour <strong>${serviceName}</strong> a été partagé avec vous.</p>
      <p>Cliquez sur ce lien pour le consulter — il expirera dans 24h et ne peut être utilisé qu'une seule fois :</p>
      <a href="${link}">${link}</a>
      <p>Si vous n'attendiez pas ce partage, ignorez cet email.</p>
    `,
    })
}

export async function sendShareNotification(ownerEmail: string, recipientEmail: string, serviceName: string) {
    await getResend().emails.send({
        from: FROM,
        to: ownerEmail,
        subject: `Partage de mot de passe effectué`,
        html: `
      <p>Bonjour,</p>
      <p>Vous avez partagé le mot de passe de <strong>${serviceName}</strong> avec <strong>${recipientEmail}</strong>.</p>
      <p>Si vous n'êtes pas à l'origine de ce partage, changez immédiatement votre mot de passe.</p>
    `,
    })
}
