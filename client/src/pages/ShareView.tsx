import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { KeyRound } from 'lucide-react'

interface SharedService {
    name: string
    username: string
    password: string
    url?: string
}

export default function ShareView() {
    const { token } = useParams()
    const [service, setService] = useState<SharedService | null>(null)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchShared() {
            try {
                const res = await fetch(`http://localhost:3000/api/share/${token}`)
                if (!res.ok) {
                    const data = await res.json()
                    setError(data.message)
                    return
                }
                const data = await res.json()
                setService(data)
            } catch {
                setError('Erreur lors de la récupération.')
            } finally {
                setLoading(false)
            }
        }
        fetchShared()
    }, [token])

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <span className="loading loading-spinner loading-lg text-primary" />
        </div>
    )

    if (error) return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <KeyRound size={48} strokeWidth={1.2} className="text-error" />
            <p className="text-xl font-bold">Lien invalide</p>
            <p className="text-base-content/50">{error}</p>
        </div>
    )

    return (
        <div className="flex justify-center items-center min-h-screen bg-base-100">
            <div className="bg-base-200 rounded-2xl p-8 max-w-md w-full flex flex-col gap-6">

                {/* Header */}
                <div className="flex items-center gap-3 pb-4 border-b border-base-300">
                    {service?.url && (
                        <img
                            src={`https://www.google.com/s2/favicons?domain=${service.url}&sz=64`}
                            alt={service.name}
                            className="w-8 h-8 rounded"
                        />
                    )}
                    <div>
                        <p className="font-bold text-xl">{service?.name}</p>
                        {service?.url && (
                            <p className="text-xs text-base-content/50">{service.url}</p>
                        )}
                    </div>
                </div>

                {/* Identifiant */}
                {service?.username && (
                    <div className="flex justify-between items-center">
                        <span className="text-base-content/50 text-sm">Identifiant</span>
                        <span className="font-mono text-sm bg-base-300 px-3 py-1 rounded">
            {service.username}
          </span>
                    </div>
                )}

                {/* Mot de passe */}
                <div className="flex justify-between items-center">
                    <span className="text-base-content/50 text-sm">Mot de passe</span>
                    <span className="font-mono text-sm bg-base-300 px-3 py-1 rounded">
          {service?.password}
        </span>
                </div>

                <p className="text-xs text-base-content/30 text-center">
                    Ce lien a été utilisé et n'est plus valide.
                </p>

            </div>
        </div>
    )
}