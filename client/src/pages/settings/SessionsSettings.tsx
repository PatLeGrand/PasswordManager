import { useState, useEffect } from 'react'
import { Monitor, Trash2, LogOut, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { fetchWithAuth } from '../../../../server/src/lib/api.ts'

interface Session {
    id: string
    ip: string
    device: string
    createdAt: string
    token: string
}

function getToken() {
    return localStorage.getItem('token') ?? ''
}

export default function SessionsSettings() {
    const navigate = useNavigate()
    const [sessions, setSessions] = useState<Session[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [revoking, setRevoking] = useState<string | null>(null)
    const [revokingAll, setRevokingAll] = useState(false)

    useEffect(() => {
        fetchSessions()
    }, [])

    async function fetchSessions() {
        setLoading(true)
        try {
            const res = await fetchWithAuth('/api/auth/sessions')
            const data = await res.json()
            setSessions(data)
        } catch {
            setError('Impossible de charger les sessions.')
        } finally {
            setLoading(false)
        }
    }

    async function handleRevoke(id: string) {
        setRevoking(id)
        try {
            await fetchWithAuth(`/api/auth/sessions/${id}`, { method: 'DELETE' })
            setSessions(prev => prev.filter(s => s.id !== id))
        } catch {
            setError('Erreur lors de la révocation.')
        } finally {
            setRevoking(null)
        }
    }

    async function handleRevokeAll() {
        setRevokingAll(true)
        try {
            await fetchWithAuth('/api/auth/sessions', { method: 'DELETE' })
            await fetchSessions()
        } catch {
            setError('Erreur lors de la révocation.')
        } finally {
            setRevokingAll(false)
        }
    }

    const currentToken = getToken()

    return (
        <div className="p-8 max-w-5xl mx-auto">

            <button className="btn btn-ghost gap-2 mb-10" onClick={() => navigate('/settings')}>
                <ArrowLeft size={18} />
                Retour
            </button>

            <div className="mb-10">
                <h1 className="text-3xl font-bold">Sessions</h1>
                <p className="text-base-content/50 text-sm mt-1">Connexions actives sur votre compte.</p>
            </div>

            <div className="flex flex-col gap-4">
                <div className="flex justify-end">
                    <button
                        className="btn btn-error btn-outline btn-sm gap-2"
                        onClick={handleRevokeAll}
                        disabled={revokingAll}
                    >
                        {revokingAll
                            ? <span className="loading loading-spinner loading-xs" />
                            : <><LogOut size={14} /> Tout révoquer</>
                        }
                    </button>
                </div>

                {error && <div className="alert alert-error text-sm">{error}</div>}

                {loading ? (
                    <div className="flex justify-center py-6">
                        <span className="loading loading-spinner loading-md" />
                    </div>
                ) : sessions.length === 0 ? (
                    <p className="text-base-content/50 text-sm">Aucune session active.</p>
                ) : (
                    <ul className="flex flex-col gap-3">
                        {sessions.map(session => (
                            <li
                                key={session.id}
                                className="flex items-center justify-between bg-base-200 rounded-xl px-5 py-4"
                            >
                                <div className="flex items-center gap-3">
                                    <Monitor size={18} className="text-primary" />
                                    <div>
                                        <p className="font-medium text-sm">{session.device}</p>
                                        <p className="text-xs text-base-content/50">
                                            {session.ip} — {new Date(session.createdAt).toLocaleString('fr-FR')}
                                        </p>
                                        {session.token === currentToken && (
                                            <span className="badge badge-success badge-xs mt-1">Session actuelle</span>
                                        )}
                                    </div>
                                </div>
                                {session.token !== currentToken && (
                                    <button
                                        className="btn btn-ghost btn-sm text-error"
                                        onClick={() => handleRevoke(session.id)}
                                        disabled={revoking === session.id}
                                    >
                                        {revoking === session.id
                                            ? <span className="loading loading-spinner loading-xs" />
                                            : <Trash2 size={15} />
                                        }
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}