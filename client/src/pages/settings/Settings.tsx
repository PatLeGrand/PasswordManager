import { useNavigate } from 'react-router-dom'
import { Lock, Mail, Smartphone, Monitor, Fingerprint } from 'lucide-react'

const cards = [
    {
        icon: Lock,
        title: 'Mot de passe',
        description: 'Modifier votre mot de passe',
        route: '/settings/password',
    },
    {
        icon: Mail,
        title: 'MFA Email',
        description: 'Code OTP par email',
        route: '/settings/mfa-email',
    },
    {
        icon: Smartphone,
        title: 'MFA Token',
        description: 'Google Authenticator',
        route: '/settings/totp',
    },
    {
        icon: Monitor,
        title: 'Sessions',
        description: 'Connexions actives',
        route: '/settings/sessions',
    },
    {
        icon: Fingerprint,
        title: 'Passkey',
        description: 'Login biométrique',
        route: '/settings/passkey',
    },
]

export default function Settings() {
    const navigate = useNavigate()

    return (
        <div className="p-8">

            <div className="mb-10">
                <h1 className="text-3xl font-bold">Sécurité</h1>
                <p className="text-base-content/50 text-sm mt-1">
                    Gérez vos méthodes d'authentification
                </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map(({ icon: Icon, title, description, route }) => (
                    <button
                        key={route}
                        onClick={() => navigate(route)}
                        className="card bg-base-200 hover:bg-base-300 hover:scale-[1.02] transition-all duration-200 cursor-pointer text-left"
                    >
                        <div className="card-body gap-6 p-8">
                            <div className="p-3 bg-primary/10 rounded-xl w-fit">
                                <Icon size={28} className="text-primary" />
                            </div>
                            <div>
                                <p className="font-bold text-base">{title}</p>
                                <p className="text-sm text-base-content/50 mt-1">{description}</p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>

        </div>
    )
}