import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Smartphone } from 'lucide-react'
import {useEffect, useState} from 'react'

export default function TOTPSettings() {
    const navigate = useNavigate()
    const [step, setStep] = useState<'idle' | 'setup' | 'verify' | 'done'>('idle')
    const [qrUrl, setQrUrl] = useState('')
    const [code, setCode] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        async function loadMe() {
            const res = await fetch('http://localhost:3000/api/auth/me', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            })
            const data = await res.json()
            if (data.totpEnabled) setStep('done')
        }
        loadMe()
    }, [])

    async function startSetup() {
        setLoading(true)
        setError('')
        try {
            const res = await fetch('http://localhost:3000/api/auth/totp/setup', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            })
            const data = await res.json()
            setQrUrl(data.qrCodeUrl)
            setStep('setup')
        } catch {
            setError('Impossible de générer le QR code.')
        } finally {
            setLoading(false)
        }
    }

    async function verifyCode() {
        setLoading(true)
        setError('')
        try {
            const res = await fetch('http://localhost:3000/api/auth/totp/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ code }),
            })
            if (!res.ok) throw new Error()
            setStep('done')
        } catch {
            setError('Code incorrect. Réessayez.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-8">

            <button className="btn btn-ghost gap-2 mb-10" onClick={() => navigate('/settings')}>
                <ArrowLeft size={18} />
                Retour
            </button>

            <h1 className="text-3xl font-bold mb-2">MFA Token (TOTP)</h1>
            <p className="text-base-content/50 mb-10">
                Scannez un QR code avec Google Authenticator pour sécuriser votre compte.
            </p>

            <div className="max-w-lg bg-base-200 rounded-2xl p-8 flex flex-col gap-6">

                {step === 'idle' && (
                    <button className="btn btn-primary w-full" onClick={startSetup} disabled={loading}>
                        {loading ? <span className="loading loading-spinner loading-sm" /> : <Smartphone size={16} />}
                        Configurer l'authentificateur
                    </button>
                )}

                {step === 'setup' && (
                    <>
                        <p className="text-sm text-base-content/60">
                            Scannez ce QR code avec <strong>Google Authenticator</strong>.
                        </p>
                        {qrUrl && (
                            <div className="flex justify-center">
                                <img src={qrUrl} alt="QR code TOTP" className="w-48 h-48 rounded-xl" />
                            </div>
                        )}
                        <button className="btn btn-primary w-full" onClick={() => setStep('verify')}>
                            J'ai scanné le QR code
                        </button>
                    </>
                )}

                {step === 'verify' && (
                    <>
                        <p className="text-sm text-base-content/60">
                            Entrez le code à 6 chiffres affiché dans votre application.
                        </p>
                        <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            placeholder="123456"
                            className="input input-bordered w-full text-center text-2xl tracking-widest font-mono"
                            value={code}
                            onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                        />
                        {error && <p className="text-error text-sm">{error}</p>}
                        <button
                            className="btn btn-primary w-full"
                            onClick={verifyCode}
                            disabled={loading || code.length !== 6}
                        >
                            {loading ? <span className="loading loading-spinner loading-sm" /> : 'Vérifier et activer'}
                        </button>
                    </>
                )}

                {step === 'done' && (
                    <div className="alert alert-success">
                        <span>TOTP activé avec succès !</span>
                    </div>
                )}

            </div>
        </div>
    )
}