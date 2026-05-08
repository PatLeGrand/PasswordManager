import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import type { AuthResponse } from '../types'
import { Mail, Smartphone, ChevronRight } from 'lucide-react'

type Step = 'credentials' | 'mfa-choice' | 'mfa-code'
type MfaMethod = 'email' | 'totp'

export default function Login() {
    const navigate = useNavigate()

    // Étape courante
    const [step, setStep] = useState<Step>('credentials')

    // Champs du formulaire
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    // MFA
    const [availableMethods, setAvailableMethods] = useState<MfaMethod[]>([])
    const [chosenMethod, setChosenMethod] = useState<MfaMethod | null>(null)
    const [otpCode, setOtpCode] = useState('')

    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    // ── Étape 1 : vérification email + mot de passe ──
    async function handleCredentials() {
        setLoading(true)
        setError('')
        try {
            const res = await api.post('/auth/login', { email, password })
            const data = res.data

            if (data.mfaRequired) {
                // Le backend nous dit quelles méthodes sont dispo
                setAvailableMethods(data.methods)

                if (data.methods.length === 1) {
                    // Une seule méthode → on passe directement à la saisie du code
                    setChosenMethod(data.methods[0])
                    setStep('mfa-code')
                } else {
                    // Plusieurs méthodes → on affiche le choix
                    setStep('mfa-choice')
                }
            } else {
                // Aucun MFA → JWT direct
                finishLogin(data)
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erreur serveur')
        } finally {
            setLoading(false)
        }
    }

    // ── Étape 2 : l'user choisit sa méthode ──
    function handleMethodChoice(method: MfaMethod) {
        setChosenMethod(method)
        setStep('mfa-code')
    }

    // ── Étape 3 : vérification du code ──
    async function handleVerifyCode() {
        setLoading(true)
        setError('')
        try {
            let res

            if (chosenMethod === 'email') {
                res = await api.post('/auth/verify-otp', { email, code: otpCode })
            } else {
                res = await api.post('/auth/verify-totp-login', { email, code: otpCode })
            }

            finishLogin(res.data)
        } catch (err: any) {
            setError(err.response?.data?.message || 'Code incorrect')
        } finally {
            setLoading(false)
        }
    }

    // ── Sauvegarde le token et redirige ──
    function finishLogin(data: AuthResponse) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        navigate('/dashboard')
    }

    return (
        <div className="min-h-screen bg-base-200 flex items-center justify-center">
            <div className="card w-96 bg-base-100 shadow-xl">
                <div className="card-body">
                    <h1 className="text-3xl font-bold text-center mb-2">Aether</h1>
                    <p className="text-center text-base-content/60 mb-6">
                        {step === 'credentials' && 'Connectez-vous à votre coffre'}
                        {step === 'mfa-choice' && 'Choisissez votre méthode de vérification'}
                        {step === 'mfa-code' && (chosenMethod === 'email' ? 'Code envoyé par email' : 'Code Google Authenticator')}
                    </p>

                    {error && (
                        <div className="alert alert-error mb-4">
                            <span>{error}</span>
                        </div>
                    )}

                    {/* ── Étape 1 : Credentials ── */}
                    {step === 'credentials' && (
                        <div className="flex flex-col gap-4">
                            <label className="form-control">
                                <div className="label"><span className="label-text">Email</span></div>
                                <input
                                    type="email"
                                    placeholder="vous@exemple.com"
                                    className="input input-bordered w-full"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                            </label>
                            <label className="form-control">
                                <div className="label"><span className="label-text">Mot de passe</span></div>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="input input-bordered w-full"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleCredentials()}
                                />
                            </label>
                            <button
                                className="btn btn-primary w-full"
                                onClick={handleCredentials}
                                disabled={loading}
                            >
                                {loading ? <span className="loading loading-spinner loading-sm" /> : 'Se connecter'}
                            </button>
                            <p className="text-center text-sm text-base-content/60">
                                Pas de compte ?{' '}
                                <Link to="/signup" className="link link-primary">S'inscrire</Link>
                            </p>
                        </div>
                    )}

                    {/* ── Étape 2 : Choix de la méthode ── */}
                    {step === 'mfa-choice' && (
                        <div className="flex flex-col gap-3">
                            {availableMethods.includes('email') && (
                                <button
                                    className="btn btn-outline w-full justify-start gap-3"
                                    onClick={() => handleMethodChoice('email')}
                                >
                                    <Mail size={18} />
                                    <div className="text-left">
                                        <div className="font-medium">Code par email</div>
                                        <div className="text-xs text-base-content/60">Un code vous a été envoyé</div>
                                    </div>
                                    <ChevronRight size={16} className="ml-auto" />
                                </button>
                            )}
                            {availableMethods.includes('totp') && (
                                <button
                                    className="btn btn-outline w-full justify-start gap-3"
                                    onClick={() => handleMethodChoice('totp')}
                                >
                                    <Smartphone size={18} />
                                    <div className="text-left">
                                        <div className="font-medium">Google Authenticator</div>
                                        <div className="text-xs text-base-content/60">Code à 6 chiffres de votre app</div>
                                    </div>
                                    <ChevronRight size={16} className="ml-auto" />
                                </button>
                            )}
                            <button
                                className="btn btn-ghost btn-sm mt-2"
                                onClick={() => setStep('credentials')}
                            >
                                ← Retour
                            </button>
                        </div>
                    )}

                    {/* ── Étape 3 : Saisie du code ── */}
                    {step === 'mfa-code' && (
                        <div className="flex flex-col gap-4">
                            <p className="text-sm text-base-content/60">
                                {chosenMethod === 'email'
                                    ? 'Entrez le code à 6 chiffres reçu par email.'
                                    : 'Entrez le code affiché dans Google Authenticator.'}
                            </p>
                            <input
                                type="text"
                                inputMode="numeric"
                                placeholder="000000"
                                maxLength={6}
                                className="input input-bordered w-full text-center text-2xl tracking-widest"
                                value={otpCode}
                                onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                onKeyDown={e => e.key === 'Enter' && handleVerifyCode()}
                                autoFocus
                            />
                            <button
                                className="btn btn-primary w-full"
                                onClick={handleVerifyCode}
                                disabled={loading || otpCode.length !== 6}
                            >
                                {loading ? <span className="loading loading-spinner loading-sm" /> : 'Vérifier'}
                            </button>
                            <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => {
                                    setStep(availableMethods.length > 1 ? 'mfa-choice' : 'credentials')
                                    setOtpCode('')
                                    setError('')
                                }}
                            >
                                ← Retour
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}