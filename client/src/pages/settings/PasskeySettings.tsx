import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Fingerprint, Laptop, Smartphone, Trash2, Plus, ShieldCheck } from 'lucide-react'
import { startRegistration } from '@simplewebauthn/browser'
import { fetchWithAuth } from '../../../../server/src/lib/api.ts'

interface Passkey {
    id:         string
    name:       string | null
    deviceType: string
    backedUp:   boolean
    createdAt:  string
}

export default function PasskeySettings() {
    const navigate = useNavigate()
    const [passkeys, setPasskeys]   = useState<Passkey[]>([])
    const [loading, setLoading]     = useState(true)
    const [adding, setAdding]       = useState(false)
    const [deleting, setDeleting]   = useState<string | null>(null)
    const [error, setError]         = useState('')
    const [success, setSuccess]     = useState('')

    useEffect(() => {
        loadPasskeys()
    }, [])

    async function loadPasskeys() {
        setLoading(true)
        try {
            const res  = await fetchWithAuth('/api/auth/webauthn/passkeys')
            const data = await res.json()
            setPasskeys(data)
        } catch {
            setError('Impossible de charger les passkeys.')
        } finally {
            setLoading(false)
        }
    }

    async function handleAdd() {
        setAdding(true)
        setError('')
        setSuccess('')
        try {
            // 1. Récupère les options depuis le serveur
            const optRes  = await fetchWithAuth('/api/auth/webauthn/register/options')
            const options = await optRes.json()

            // 2. Le navigateur ouvre le dialogue (Touch ID, Windows Hello, etc.)
            const credential = await startRegistration({ optionsJSON: options })

            // 3. Vérifie et enregistre côté serveur
            const verifyRes = await fetchWithAuth('/api/auth/webauthn/register/verify', {
                method: 'POST',
                body:   JSON.stringify({ credential }),
            })

            if (!verifyRes.ok) throw new Error()

            setSuccess('Passkey ajoutée avec succès !')
            await loadPasskeys()
        } catch (err: any) {
            // L'utilisateur a annulé le dialogue → pas d'erreur affichée
            if (err?.name === 'NotAllowedError') return
            setError('Échec de l\'ajout de la passkey.')
        } finally {
            setAdding(false)
        }
    }

    async function handleDelete(id: string) {
        setDeleting(id)
        setError('')
        try {
            const res = await fetchWithAuth(`/api/auth/webauthn/passkeys/${id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error()
            setPasskeys(prev => prev.filter(p => p.id !== id))
        } catch {
            setError('Erreur lors de la suppression.')
        } finally {
            setDeleting(null)
        }
    }

    return (
        <div className="p-8 max-w-5xl mx-auto">

            <button className="btn btn-ghost gap-2 mb-10" onClick={() => navigate('/settings')}>
                <ArrowLeft size={18} />
                Retour
            </button>

            <h1 className="text-3xl font-bold mb-2">Passkeys</h1>
            <p className="text-base-content/50 mb-10">
                Connectez-vous sans mot de passe grâce à Touch ID, Windows Hello ou une clé de sécurité.
            </p>

            <div className="max-w-lg flex flex-col gap-4">

                {/* Bouton ajouter */}
                <button
                    className="btn btn-primary gap-2"
                    onClick={handleAdd}
                    disabled={adding}
                >
                    {adding
                        ? <span className="loading loading-spinner loading-sm" />
                        : <Plus size={16} />
                    }
                    Ajouter une passkey
                </button>

                {error   && <div className="alert alert-error text-sm py-2">{error}</div>}
                {success && <div className="alert alert-success text-sm py-2">{success}</div>}

                {/* Liste */}
                {loading ? (
                    <div className="flex justify-center py-8">
                        <span className="loading loading-spinner loading-md" />
                    </div>
                ) : passkeys.length === 0 ? (
                    <div className="bg-base-200 rounded-2xl p-10 flex flex-col items-center gap-3 text-center">
                        <Fingerprint size={36} className="text-base-content/20" />
                        <p className="font-medium text-sm">Aucune passkey enregistrée</p>
                        <p className="text-xs text-base-content/40">
                            Ajoutez une passkey pour vous connecter sans mot de passe.
                        </p>
                    </div>
                ) : (
                    <ul className="flex flex-col gap-3">
                        {passkeys.map(passkey => (
                            <li
                                key={passkey.id}
                                className="flex items-center justify-between bg-base-200 rounded-xl px-5 py-4"
                            >
                                <div className="flex items-center gap-3">
                                    {passkey.deviceType === 'multiDevice'
                                        ? <Smartphone size={18} className="text-primary" />
                                        : <Laptop     size={18} className="text-primary" />
                                    }
                                    <div>
                                        <p className="font-medium text-sm">
                                            {passkey.name ?? (passkey.deviceType === 'multiDevice' ? 'Passkey mobile' : 'Passkey appareil')}
                                        </p>
                                        <p className="text-xs text-base-content/50">
                                            Ajoutée le {new Date(passkey.createdAt).toLocaleDateString('fr-FR')}
                                        </p>
                                        {passkey.backedUp && (
                                            <span className="inline-flex items-center gap-1 text-xs text-success mt-0.5">
                                                <ShieldCheck size={11} /> Sauvegardée dans le cloud
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    className="btn btn-ghost btn-sm text-error"
                                    onClick={() => handleDelete(passkey.id)}
                                    disabled={deleting === passkey.id}
                                >
                                    {deleting === passkey.id
                                        ? <span className="loading loading-spinner loading-xs" />
                                        : <Trash2 size={15} />
                                    }
                                </button>
                            </li>
                        ))}
                    </ul>
                )}

            </div>
        </div>
    )
}
