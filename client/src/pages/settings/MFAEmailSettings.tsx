import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail } from 'lucide-react'
import { useState, useEffect } from 'react'
import {fetchWithAuth} from "../../../../server/src/lib/api.ts";

export default function MFAEmailSettings() {
    const navigate = useNavigate()
    const [enabled, setEnabled] = useState(true)

    const [loading, setLoading] = useState(false)

    useEffect(() => {
        async function loadMe() {
            const res = await fetchWithAuth('/api/auth/me')
            const data = await res.json()
            setEnabled(data.mfaEmail)
        }
        loadMe()
    }, [])

    async function handleToggle() {
        setLoading(true)
        try {
            const res = await fetchWithAuth('/api/auth/mfa/email', {
                method: 'POST',
                body: JSON.stringify({ enabled: !enabled }),
            })
            const data = await res.json()
            console.log(data)
            if (!res.ok) throw new Error()
            setEnabled(v => !v)
        } catch {
            alert('Erreur lors de la mise à jour.')
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

            <h1 className="text-3xl font-bold mb-2">MFA Email</h1>
            <p className="text-base-content/50 mb-10">
                Un code OTP est envoyé par email à chaque connexion.
            </p>

            <div className="max-w-lg bg-base-200 rounded-2xl p-8 flex flex-col gap-6">

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Mail size={22} className="text-primary" />
                        <div>
                            <p className="font-semibold">Code par email</p>
                            <p className="text-sm text-base-content/50">
                                {enabled ? 'Activé — OTP envoyé à chaque login' : 'Désactivé'}
                            </p>
                        </div>
                    </div>
                    <input
                        type="checkbox"
                        className="toggle toggle-primary"
                        checked={enabled}
                        onChange={handleToggle}
                        disabled={loading}
                    />
                </div>

            </div>

        </div>
    )
}