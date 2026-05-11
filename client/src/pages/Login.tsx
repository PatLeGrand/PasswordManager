import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Shield, Mail, Lock, Eye, EyeOff, ArrowRight, Check, Smartphone, ChevronRight, Fingerprint } from 'lucide-react'
import { startAuthentication } from '@simplewebauthn/browser'
import api from '../api/axios'
import type { AuthResponse } from '../types'

type Step = 'credentials' | 'mfa-choice' | 'mfa-code'
type MfaMethod = 'email' | 'totp'

const brandFeatures = [
    'Chiffrement AES-256 de bout en bout',
    'Double authentification intégrée',
    'Partage sécurisé à usage unique',
]

export default function Login() {
    const navigate = useNavigate()

    const [step, setStep] = useState<Step>('credentials')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [availableMethods, setAvailableMethods] = useState<MfaMethod[]>([])
    const [chosenMethod, setChosenMethod] = useState<MfaMethod | null>(null)
    const [otpCode, setOtpCode] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleCredentials() {
        setLoading(true)
        setError('')
        try {
            const res = await api.post('/auth/login', { email, password })
            const data = res.data
            if (data.mfaRequired) {
                setAvailableMethods(data.methods)
                if (data.methods.length === 1) {
                    setChosenMethod(data.methods[0])
                    setStep('mfa-code')
                } else {
                    setStep('mfa-choice')
                }
            } else {
                finishLogin(data)
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erreur serveur')
        } finally {
            setLoading(false)
        }
    }

    async function handlePasskeyLogin() {
        if (!email) {
            setError('Entrez votre email pour utiliser une passkey.')
            return
        }
        setLoading(true)
        setError('')
        try {
            const optRes = await api.get(`/auth/webauthn/authenticate/options?email=${encodeURIComponent(email)}`)
            const credential = await startAuthentication({ optionsJSON: optRes.data })
            const verifyRes = await api.post('/auth/webauthn/authenticate/verify', { email, credential })
            finishLogin(verifyRes.data)
        } catch (err: any) {
            setError(err.response?.data?.message || 'Authentification par passkey échouée.')
        } finally {
            setLoading(false)
        }
    }

    async function handleVerifyCode() {
        setLoading(true)
        setError('')
        try {
            const res = chosenMethod === 'email'
                ? await api.post('/auth/verify-otp', { email, code: otpCode })
                : await api.post('/auth/verify-totp-login', { email, code: otpCode })
            finishLogin(res.data)
        } catch (err: any) {
            setError(err.response?.data?.message || 'Code incorrect')
        } finally {
            setLoading(false)
        }
    }

    function finishLogin(data: AuthResponse) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        navigate('/dashboard')
    }

    const stepTitles: Record<Step, { title: string; subtitle: string }> = {
        'credentials':  { title: 'Bon retour.',        subtitle: 'Connectez-vous à votre coffre.' },
        'mfa-choice':   { title: 'Vérification.',      subtitle: 'Choisissez votre méthode.' },
        'mfa-code':     { title: 'Code de sécurité.',  subtitle: chosenMethod === 'email' ? 'Entrez le code reçu par email.' : 'Entrez le code Google Authenticator.' },
    }

    return (
        <div className="min-h-screen grid lg:grid-cols-[420px_1fr]">

            {/* ── Brand panel ── */}
            <div className="hidden lg:flex flex-col p-10 relative overflow-hidden"
                style={{ background: 'linear-gradient(160deg, oklch(var(--p)), oklch(var(--s)))' }}
            >
                {/* Dot pattern */}
                <div className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)',
                        backgroundSize: '28px 28px',
                    }}
                />

                {/* Logo */}
                <Link to="/" className="relative z-10 flex items-center gap-2.5 w-fit">
                    <Shield size={22} className="text-primary-content" />
                    <span className="font-black text-xl text-primary-content">Aether</span>
                </Link>

                {/* Center content */}
                <div className="relative z-10 my-auto">
                    <h2 className="text-4xl font-black text-primary-content leading-tight mb-8">
                        Votre coffre<br />vous attend.
                    </h2>
                    <div className="flex flex-col gap-4">
                        {brandFeatures.map(f => (
                            <div key={f} className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-primary-content/20 flex items-center justify-center flex-shrink-0">
                                    <Check size={11} className="text-primary-content" />
                                </div>
                                <span className="text-primary-content/80 text-sm">{f}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom */}
                <p className="relative z-10 text-primary-content/40 text-xs">
                    Pas encore de compte ?{' '}
                    <Link to="/signup" className="text-primary-content/70 underline underline-offset-2 hover:text-primary-content transition-colors">
                        Créer un compte
                    </Link>
                </p>
            </div>

            {/* ── Form panel ── */}
            <div className="flex flex-col items-center justify-center p-8 bg-base-100 min-h-screen lg:min-h-0">
                <div className="w-full max-w-sm">

                    {/* Mobile logo */}
                    <Link to="/" className="lg:hidden flex items-center gap-2 mb-10 w-fit">
                        <Shield size={20} className="text-primary" />
                        <span className="font-black text-lg">Aether</span>
                    </Link>

                    {/* Step indicator */}
                    <div className="flex gap-1.5 mb-10">
                        {(['credentials', 'mfa-choice', 'mfa-code'] as Step[]).map((s, i) => (
                            <div
                                key={s}
                                className={`h-1 rounded-full transition-all duration-500 ${
                                    s === step ? 'bg-primary flex-[2]' :
                                    i < (['credentials', 'mfa-choice', 'mfa-code'] as Step[]).indexOf(step)
                                        ? 'bg-primary/40 flex-1' : 'bg-base-300 flex-1'
                                }`}
                            />
                        ))}
                    </div>

                    {/* Title */}
                    <div
                        key={step + '-title'}
                        className="mb-8"
                        style={{ animation: 'fade-slide-in 0.25s ease' }}
                    >
                        <h1 className="text-3xl font-black tracking-tight mb-1">
                            {stepTitles[step].title}
                        </h1>
                        <p className="text-base-content/50 text-sm">{stepTitles[step].subtitle}</p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="alert alert-error alert-sm mb-6 py-2.5 text-sm">
                            <span>{error}</span>
                        </div>
                    )}

                    {/* ── Step: credentials ── */}
                    {step === 'credentials' && (
                        <div
                            key="credentials"
                            className="flex flex-col gap-4"
                            style={{ animation: 'fade-slide-in 0.25s ease' }}
                        >
                            <div className="relative">
                                <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/30 pointer-events-none" />
                                <input
                                    type="email"
                                    placeholder="votre@email.com"
                                    className="input input-bordered w-full pl-11"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleCredentials()}
                                    autoFocus
                                />
                            </div>

                            <div className="relative">
                                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/30 pointer-events-none" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className="input input-bordered w-full pl-11 pr-11"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleCredentials()}
                                />
                                <button
                                    type="button"
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-base-content/30 hover:text-base-content transition-colors"
                                    onClick={() => setShowPassword(v => !v)}
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>

                            <button
                                className="btn btn-primary w-full rounded-xl gap-2 mt-2"
                                onClick={handleCredentials}
                                disabled={loading || !email || !password}
                            >
                                {loading ? <span className="loading loading-spinner loading-sm" /> : <>Continuer <ArrowRight size={16} /></>}
                            </button>

                            <div className="flex items-center gap-3 my-1">
                                <div className="flex-1 h-px bg-base-300" />
                                <span className="text-xs text-base-content/30">ou</span>
                                <div className="flex-1 h-px bg-base-300" />
                            </div>

                            <button
                                className="btn btn-outline w-full rounded-xl gap-2"
                                onClick={handlePasskeyLogin}
                                disabled={loading}
                            >
                                <Fingerprint size={16} />
                                Se connecter avec une passkey
                            </button>

                            <p className="text-center text-sm text-base-content/40 mt-2">
                                Pas de compte ?{' '}
                                <Link to="/signup" className="text-primary hover:underline font-medium">
                                    S'inscrire
                                </Link>
                            </p>
                        </div>
                    )}

                    {/* ── Step: MFA choice ── */}
                    {step === 'mfa-choice' && (
                        <div
                            key="mfa-choice"
                            className="flex flex-col gap-3"
                            style={{ animation: 'fade-slide-in 0.25s ease' }}
                        >
                            {availableMethods.includes('email') && (
                                <button
                                    className="flex items-center gap-4 p-4 rounded-xl border border-base-300 hover:border-primary hover:bg-primary/5 transition-all text-left w-full group"
                                    onClick={() => { setChosenMethod('email'); setStep('mfa-code') }}
                                >
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <Mail size={18} className="text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-sm">Code par email</p>
                                        <p className="text-xs text-base-content/50 mt-0.5">Un code vous a été envoyé</p>
                                    </div>
                                    <ChevronRight size={16} className="text-base-content/30 group-hover:text-primary transition-colors" />
                                </button>
                            )}
                            {availableMethods.includes('totp') && (
                                <button
                                    className="flex items-center gap-4 p-4 rounded-xl border border-base-300 hover:border-primary hover:bg-primary/5 transition-all text-left w-full group"
                                    onClick={() => { setChosenMethod('totp'); setStep('mfa-code') }}
                                >
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <Smartphone size={18} className="text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-sm">Google Authenticator</p>
                                        <p className="text-xs text-base-content/50 mt-0.5">Code à 6 chiffres de votre app</p>
                                    </div>
                                    <ChevronRight size={16} className="text-base-content/30 group-hover:text-primary transition-colors" />
                                </button>
                            )}
                            <button
                                className="btn btn-ghost btn-sm mt-2 text-base-content/50"
                                onClick={() => setStep('credentials')}
                            >
                                ← Retour
                            </button>
                        </div>
                    )}

                    {/* ── Step: OTP code ── */}
                    {step === 'mfa-code' && (
                        <div
                            key="mfa-code"
                            className="flex flex-col gap-4"
                            style={{ animation: 'fade-slide-in 0.25s ease' }}
                        >
                            <div className="relative">
                                {chosenMethod === 'email'
                                    ? <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/30 pointer-events-none" />
                                    : <Smartphone size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/30 pointer-events-none" />
                                }
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="000 000"
                                    maxLength={6}
                                    className="input input-bordered w-full pl-11 text-center text-2xl tracking-[0.4em] font-mono"
                                    value={otpCode}
                                    onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                    onKeyDown={e => e.key === 'Enter' && otpCode.length === 6 && handleVerifyCode()}
                                    autoFocus
                                />
                            </div>

                            <button
                                className="btn btn-primary w-full rounded-xl gap-2"
                                onClick={handleVerifyCode}
                                disabled={loading || otpCode.length !== 6}
                            >
                                {loading ? <span className="loading loading-spinner loading-sm" /> : <>Vérifier <ArrowRight size={16} /></>}
                            </button>

                            <button
                                className="btn btn-ghost btn-sm text-base-content/50"
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
