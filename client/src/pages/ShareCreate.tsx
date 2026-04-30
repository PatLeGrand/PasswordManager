import { useParams, useNavigate } from 'react-router-dom'
import { Mail, ArrowLeft } from 'lucide-react'
import { useState, useEffect } from 'react'
import type {Service} from '../types'

export default function ShareCreate() {
    const { serviceId } = useParams()
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [service, setService] = useState<Service | null>(null)

    useEffect(() => {
        async function fetchService() {
            const res = await fetch(`http://localhost:3000/api/services/${serviceId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            })
            const data = await res.json()
            setService(data)
        }
        fetchService()
    }, [serviceId])

    async function handleShare() {
        if (!email.trim()) {
            setError('Email obligatoire.')
            return
        }
        setLoading(true)
        setError('')
        try {
            const res = await fetch(`http://localhost:3000/api/share/${serviceId}/share`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ email }),
            })
            if (!res.ok) throw new Error()
            navigate('/dashboard')
        } catch {
            setError("Erreur lors de l'envoi.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-8">

            <button
                className="btn btn-ghost gap-2 mb-10"
                onClick={() => navigate('/dashboard')}
            >
                <ArrowLeft size={18} />
                Retour
            </button>

            <h1 className="text-3xl font-bold mb-2">Partager un service</h1>
            <p className="text-base-content/50 mb-10">
                Un lien unique sera envoyé par email. Il expirera après 24h et ne pourra être utilisé qu'une seule fois.
            </p>

            {/* Card centrée et limitée en largeur */}
            <div className="max-w-lg bg-base-200 rounded-2xl p-8 flex flex-col gap-6">

                <label className="form-control">
                    <div className="label mb-1">
                        <span className="label-text text-base">Email du destinataire</span>
                    </div>
                    {service && (
                        <div className="flex items-center gap-3 pb-4 border-b border-base-300">
                            {service.url && (
                                <img
                                    src={`https://www.google.com/s2/favicons?domain=${service.url}&sz=64`}
                                    alt={service.name}
                                    className="w-8 h-8 rounded"
                                />
                            )}
                            <div>
                                <p className="font-semibold">{service.name}</p>
                                {service.url && (
                                    <p className="text-xs text-base-content/50">{service.url}</p>
                                )}
                            </div>
                        </div>
                    )}

                    <label className="input input-bordered input-lg flex items-center gap-3">
                        <Mail size={18} className="text-base-content/40" />
                        <input
                            type="email"
                            placeholder="ami@example.com"
                            className="grow"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </label>
                </label>

                {error && <p className="text-error text-sm">{error}</p>}

                <button
                    className="btn btn-primary btn-lg w-full"
                    onClick={handleShare}
                    disabled={loading}
                >
                    {loading ? <span className="loading loading-spinner" /> : 'Envoyer le lien'}
                </button>

            </div>
        </div>
    )
}