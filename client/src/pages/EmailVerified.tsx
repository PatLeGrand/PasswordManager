import { useSearchParams, Link } from 'react-router-dom'
import { CheckCircle, XCircle } from 'lucide-react'

export default function EmailVerified() {
    const [params] = useSearchParams()
    const success = params.get('success') === 'true'

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200">
            <div className="card bg-base-100 shadow-xl w-full max-w-md text-center p-8">
                <div className="flex justify-center mb-6">
                    <img src="/Aether.png" className="w-12 h-12 object-contain" alt="Aether" />
                </div>

                {success ? (
                    <>
                        <CheckCircle className="mx-auto mb-4 text-success" size={56} />
                        <h1 className="text-2xl font-bold mb-2">Email vérifié !</h1>
                        <p className="text-base-content/70 mb-6">
                            Votre adresse email a bien été confirmée. Vous pouvez maintenant vous connecter.
                        </p>
                        <Link to="/login" className="btn btn-primary w-full">
                            Se connecter
                        </Link>
                    </>
                ) : (
                    <>
                        <XCircle className="mx-auto mb-4 text-error" size={56} />
                        <h1 className="text-2xl font-bold mb-2">Lien invalide</h1>
                        <p className="text-base-content/70 mb-6">
                            Ce lien de vérification est invalide ou a déjà été utilisé.
                        </p>
                        <Link to="/signup" className="btn btn-primary w-full">
                            Créer un compte
                        </Link>
                    </>
                )}
            </div>
        </div>
    )
}
