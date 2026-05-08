import { useState, useEffect } from 'react'
import { Monitor, Trash2, LogOut } from 'lucide-react'
import { fetchWithAuth } from '../../../../server/src/lib/api.ts'

interface Session {
    id: string
    ip: string
    device: string
    createdAt: string
    token: string
}

const API_URL = 'http://localhost:3000'

function getToken() {
    return localStorage.getItem('token') ?? ''
}

export default function SessionsSettings() {
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
            await fetch(`${API_URL}/api/auth/sessions/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${getToken()}` },
            })
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
            await fetch(`${API_URL}/api/auth/sessions`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${getToken()}` },
            })
            await fetchSessions()
        } catch {
            setError('Erreur lors de la révocation.')
        } finally {
            setRevokingAll(false)
        }
    }

    const currentToken = getToken()

    return (
        <div className="card bg-base-200 shadow p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Sessions actives</h2>
                <button
                    className="btn btn-error btn-outline btn-sm"
                    onClick={handleRevokeAll}
                    disabled={revokingAll}
                >
                    {revokingAll
                        ? <span className="loading loading-spinner loading-xs" />
                        : <><LogOut size={14} /> Tout révoquer</>
                    }
                </button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

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
                            className="flex items-center justify-between bg-base-100 rounded-lg px-4 py-3"
                        >
                            <div className="flex items-center gap-3">
                                <Monitor size={18} className="text-primary" />
                                <div>
                                    <p className="font-medium text-sm">{session.device}</p>
                                    <p className="text-xs text-base-content/50">
                                        {session.ip} — {new Date(session.createdAt).toLocaleString('fr-CA')}
                                    </p>
                                    {session.token === currentToken && (
                                        <span className="badge badge-success badge-xs mt-1">Session actuelle</span>
                                    )}
                                </div>
                            </div>

                            {session.token !== currentToken && (
                                <button
                                    className="btn btn-ghost btn-xs text-error"
                                    onClick={() => handleRevoke(session.id)}
                                    disabled={revoking === session.id}
                                >
                                    {revoking === session.id
                                        ? <span className="loading loading-spinner loading-xs" />
                                        : <Trash2 size={14} />
                                    }
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}