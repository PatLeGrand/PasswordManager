import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Shield, Mail, Lock, User, Eye, EyeOff, ArrowRight, Check, MailCheck } from 'lucide-react'
import api from '../api/axios'
import { getPasswordStrength } from '../utils/passwordStrength'

const brandFeatures = [
    'Coffre chiffré avec AES-256',
    'Accès protégé par MFA',
    'Partage de mots de passe sécurisé',
    '100% gratuit, pour toujours',
]

const strengthSteps = ['Très faible', 'Faible', 'Moyen', 'Optimal']

export default function Signup() {
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' })
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(false)

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            await api.post('/auth/signup', form)
            setSuccess(true)
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erreur serveur')
        } finally {
            setLoading(false)
        }
    }

    const strength = getPasswordStrength(form.password)
    const strengthIndex = strengthSteps.indexOf(strength.label)
    const strengthColors = ['bg-error', 'bg-orange-400', 'bg-warning', 'bg-success']

    return (
        <div className="min-h-screen grid lg:grid-cols-[420px_1fr]">

            {/* ── Brand panel ── */}
            <div className="hidden lg:flex flex-col p-10 relative overflow-hidden"
                style={{ background: 'linear-gradient(160deg, oklch(var(--p)), oklch(var(--s)))' }}
            >
                <div className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)',
                        backgroundSize: '28px 28px',
                    }}
                />

                <Link to="/" className="relative z-10 flex items-center gap-2.5 w-fit">
                    <Shield size={22} className="text-primary-content" />
                    <span className="font-black text-xl text-primary-content">Aether</span>
                </Link>

                <div className="relative z-10 my-auto">
                    <h2 className="text-4xl font-black text-primary-content leading-tight mb-3">
                        Rejoignez Aether.
                    </h2>
                    <p className="text-primary-content/60 text-sm mb-8 leading-relaxed">
                        Créez votre coffre en quelques secondes et reprenez le contrôle de vos mots de passe.
                    </p>
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

                <p className="relative z-10 text-primary-content/40 text-xs">
                    Déjà un compte ?{' '}
                    <Link to="/login" className="text-primary-content/70 underline underline-offset-2 hover:text-primary-content transition-colors">
                        Se connecter
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

                    {success ? (
                        /* ── Success state ── */
                        <div
                            className="text-center"
                            style={{ animation: 'fade-slide-in 0.3s ease' }}
                        >
                            <div className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center mx-auto mb-6">
                                <MailCheck size={32} className="text-success" />
                            </div>
                            <h2 className="text-2xl font-black mb-2">Vérifiez vos emails.</h2>
                            <p className="text-base-content/50 text-sm leading-relaxed mb-8">
                                Un lien de confirmation a été envoyé à{' '}
                                <span className="font-medium text-base-content">{form.email}</span>.
                                Cliquez dessus pour activer votre compte.
                            </p>
                            <Link to="/login" className="btn btn-primary w-full rounded-xl gap-2">
                                Aller à la connexion
                                <ArrowRight size={16} />
                            </Link>
                        </div>
                    ) : (
                        /* ── Form ── */
                        <>
                            <div className="mb-8">
                                <h1 className="text-3xl font-black tracking-tight mb-1">Créer un compte.</h1>
                                <p className="text-base-content/50 text-sm">Votre coffre en 30 secondes.</p>
                            </div>

                            {error && (
                                <div className="alert alert-error alert-sm mb-6 py-2.5 text-sm">
                                    <span>{error}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                                {/* Name row */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="relative">
                                        <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/30 pointer-events-none" />
                                        <input
                                            type="text"
                                            name="firstName"
                                            placeholder="Prénom"
                                            className="input input-bordered w-full pl-10 text-sm"
                                            value={form.firstName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="relative">
                                        <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/30 pointer-events-none" />
                                        <input
                                            type="text"
                                            name="lastName"
                                            placeholder="Nom"
                                            className="input input-bordered w-full pl-10 text-sm"
                                            value={form.lastName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="relative">
                                    <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/30 pointer-events-none" />
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="votre@email.com"
                                        className="input input-bordered w-full pl-11"
                                        value={form.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                {/* Password */}
                                <div>
                                    <div className="relative">
                                        <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/30 pointer-events-none" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            placeholder="Mot de passe"
                                            className="input input-bordered w-full pl-11 pr-11"
                                            value={form.password}
                                            onChange={handleChange}
                                            required
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

                                    {/* Strength bar */}
                                    {form.password && (
                                        <div className="mt-2.5 space-y-1.5" style={{ animation: 'fade-slide-in 0.2s ease' }}>
                                            <div className="flex gap-1">
                                                {strengthSteps.map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                                            i <= strengthIndex
                                                                ? strengthColors[strengthIndex] ?? 'bg-base-300'
                                                                : 'bg-base-300'
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                            <p className={`text-xs font-medium ${
                                                strengthIndex === 3 ? 'text-success' :
                                                strengthIndex === 2 ? 'text-warning' :
                                                strengthIndex === 1 ? 'text-orange-400' : 'text-error'
                                            }`}>
                                                {strength.label}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary w-full rounded-xl gap-2 mt-1"
                                    disabled={loading}
                                >
                                    {loading
                                        ? <span className="loading loading-spinner loading-sm" />
                                        : <>Créer mon compte <ArrowRight size={16} /></>
                                    }
                                </button>
                            </form>

                            <p className="text-center text-sm text-base-content/40 mt-6">
                                Déjà un compte ?{' '}
                                <Link to="/login" className="text-primary hover:underline font-medium">
                                    Se connecter
                                </Link>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
