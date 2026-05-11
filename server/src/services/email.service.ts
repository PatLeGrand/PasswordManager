import nodemailer from 'nodemailer'

function getTransporter() {
    return nodemailer.createTransport({
        host: 'smtp.resend.com',
        port: 465,
        secure: true,
        auth: {
            user: 'resend',
            pass: process.env.EMAIL_PASS,
        },
    })
}

export async function sendShareEmail(to: string, link: string, serviceName: string) {
    await getTransporter().sendMail({
        from: '"Aether" <noreply@aether-manager.ca>',
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
    await getTransporter().sendMail({
        from: '"Aether" <noreply@aether-manager.ca>',
        to: ownerEmail,
        subject: `Partage de mot de passe effectué`,
        html: `
      <p>Bonjour,</p>
      <p>Vous avez partagé le mot de passe de <strong>${serviceName}</strong> avec <strong>${recipientEmail}</strong>.</p>
      <p>Si vous n'êtes pas à l'origine de ce partage, changez immédiatement votre mot de passe.</p>
    `,
    })
}

