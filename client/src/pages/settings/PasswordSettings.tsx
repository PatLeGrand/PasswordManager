import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { fetchWithAuth } from '../../../../server/src/lib/api.ts'

export default function PasswordSettings() {
    const navigate = useNavigate()
    const [form, setForm] = useState({ current: '', next: '', confirm: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    async function handleSubmit() {
        if (form.next !== form.confirm) {
            setError('Les mots de passe ne correspondent pas.')
            return
        }
        setLoading(true)
        setError('')
        setSuccess(false)
        try {
            const res = await fetchWithAuth('/api/auth/change-password', {
                method: 'POST',
                body: JSON.stringify({ currentPassword: form.current, newPassword: form.next }),
            })
            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.message || 'Erreur.')
            }
            setSuccess(true)
            setForm({ current: '', next: '', confirm: '' })
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erreur inconnue.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-8 max-w-5xl mx-auto">

            <button className="btn btn-ghost gap-2 mb-10" onClick={() => navigate('/settings')}>
                <ArrowLeft size={18} />
                Retour
            </button>

            <h1 className="text-3xl font-bold mb-2">Mot de passe</h1>
            <p className="text-base-content/50 mb-10">
                Modifiez votre mot de passe de connexion.
            </p>

            <div className="max-w-lg flex flex-col gap-4">

                <label className="form-control">
                    <div className="label pb-1">
                        <span className="label-text text-xs">Mot de passe actuel</span>
                    </div>
                    <input
                        type="password"
                        placeholder="••••••••"
                        className="input input-bordered w-full"
                        value={form.current}
                        onChange={e => setForm({ ...form, current: e.target.value })}
                    />
                </label>

                <label className="form-control">
                    <div className="label pb-1">
                        <span className="label-text text-xs">Nouveau mot de passe</span>
                    </div>
                    <input
                        type="password"
                        placeholder="••••••••"
                        className="input input-bordered w-full"
                        value={form.next}
                        onChange={e => setForm({ ...form, next: e.target.value })}
                    />
                </label>

                <label className="form-control">
                    <div className="label pb-1">
                        <span className="label-text text-xs">Confirmer le nouveau mot de passe</span>
                    </div>
                    <input
                        type="password"
                        placeholder="••••••••"
                        className="input input-bordered w-full"
                        value={form.confirm}
                        onChange={e => setForm({ ...form, confirm: e.target.value })}
                    />
                </label>

                {error && <p className="text-error text-sm">{error}</p>}
                {success && <p className="text-success text-sm">Mot de passe mis à jour !</p>}

                <button
                    className="btn btn-primary w-full mt-2"
                    onClick={handleSubmit}
                    disabled={loading || !form.current || !form.next || !form.confirm}
                >
                    {loading ? <span className="loading loading-spinner loading-sm" /> : 'Mettre à jour'}
                </button>

            </div>
        </div>
    )
}