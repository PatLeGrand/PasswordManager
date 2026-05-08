import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Shield, Lock, Share2, ShieldCheck, ArrowRight, Check, Globe, Mail, Code2, Palette } from 'lucide-react'

const themes = [
    { value: 'light',   label: 'Light' },
    { value: 'dark',    label: 'Dark' },
    { value: 'luxury',  label: 'Luxury' },
    { value: 'black',   label: 'Black' },
    { value: 'retro',   label: 'Retro' },
]

const marqueeItems = [
    'Chiffrement AES-256',
    'Double authentification',
    'Partage sécurisé',
    'Sessions actives',
    'Open source',
    'Zéro connaissance',
    'Chiffrement AES-256',
    'Double authentification',
    'Partage sécurisé',
    'Sessions actives',
    'Open source',
    'Zéro connaissance',
]

const features = [
    {
        number: '01',
        icon: Lock,
        title: 'Chiffrement de bout en bout',
        description: 'Vos mots de passe sont chiffrés avec AES-256 avant même de quitter votre appareil. Personne — pas même nous — ne peut y accéder.',
    },
    {
        number: '02',
        icon: ShieldCheck,
        title: 'Double authentification',
        description: 'Renforcez l\'accès à votre coffre avec un code email ou Google Authenticator. Même si votre mot de passe fuite, votre compte reste protégé.',
    },
    {
        number: '03',
        icon: Share2,
        title: 'Partage sans compromis',
        description: 'Partagez un accès via un lien unique, à usage unique, expirant après 24h. Le destinataire voit le mot de passe une seule fois.',
    },
]

export default function Landing() {
    const navigate = useNavigate()
    const [currentTheme, setCurrentTheme] = useState(localStorage.getItem('theme') || 'dark')

    useEffect(() => {
        if (localStorage.getItem('token')) navigate('/dashboard')
    }, [])

    function applyTheme(theme: string) {
        document.documentElement.setAttribute('data-theme', theme)
        localStorage.setItem('theme', theme)
        setCurrentTheme(theme)
    }

    return (
        <div className="min-h-screen bg-base-100 flex flex-col overflow-x-hidden">

            {/* ── Header ── */}
            <header className="sticky top-0 z-50 border-b border-base-200 bg-base-100/70 backdrop-blur-xl">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <Shield size={20} className="text-primary" />
                        <span className="font-black tracking-tight text-lg">Aether</span>
                    </div>
                    <nav className="flex items-center gap-2">
                        <div className="dropdown dropdown-end">
                            <div tabIndex={0} role="button" className="btn btn-ghost btn-sm gap-1.5 text-base-content/50">
                                <Palette size={15} />
                                <span className="capitalize text-xs">{currentTheme}</span>
                            </div>
                            <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-xl shadow-lg border border-base-200 w-36 mt-2 p-1">
                                {themes.map(t => (
                                    <li key={t.value}>
                                        <button
                                            className={`flex items-center gap-2.5 rounded-lg text-sm ${currentTheme === t.value ? 'active' : ''}`}
                                            onClick={() => applyTheme(t.value)}
                                        >
                                            <span
                                                className="w-3 h-3 rounded-full border border-base-content/10 flex-shrink-0"
                                                style={{ background: `oklch(var(--p))` }}
                                                data-theme={t.value}
                                            />
                                            {t.label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <Link to="/login" className="btn btn-ghost btn-sm text-base-content/70">
                            Connexion
                        </Link>
                        <Link to="/signup" className="btn btn-primary btn-sm gap-1.5 rounded-full px-5">
                            Commencer
                            <ArrowRight size={13} />
                        </Link>
                    </nav>
                </div>
            </header>

            {/* ── Hero ── */}
            <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 grid lg:grid-cols-2 gap-16 items-center">

                {/* Left: typography */}
                <div>
                    <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary mb-10 border border-primary/30 rounded-full px-4 py-1.5 bg-primary/5">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        Gestionnaire de mots de passe
                    </div>

                    <h1 className="leading-[0.95] mb-10">
                        <span className="block text-[clamp(3rem,7vw,5.5rem)] font-black tracking-tight">
                            Zéro fuite.
                        </span>
                        <span className="block text-[clamp(3rem,7vw,5.5rem)] font-thin tracking-tight text-base-content/40">
                            Zéro stress.
                        </span>
                        <span
                            className="block text-[clamp(3rem,7vw,5.5rem)] font-black tracking-tight"
                            style={{
                                background: 'linear-gradient(135deg, oklch(var(--p)), oklch(var(--s)))',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}
                        >
                            100% chiffré.
                        </span>
                    </h1>

                    <p className="text-base-content/55 text-lg leading-relaxed mb-10 max-w-md">
                        Aether stocke et protège vos identifiants dans un coffre chiffré localement.
                        Accédez à tout, partagez en sécurité.
                    </p>

                    <div className="flex items-center gap-4 mb-12">
                        <Link to="/signup" className="btn btn-primary btn-lg rounded-full gap-2 px-8">
                            Créer un compte
                            <ArrowRight size={17} />
                        </Link>
                        <Link to="/login" className="btn btn-ghost btn-lg text-base-content/60">
                            Se connecter
                        </Link>
                    </div>

                    <div className="flex flex-wrap gap-5 text-sm text-base-content/40">
                        {['AES-256', 'MFA inclus', 'Open source', 'Gratuit'].map(t => (
                            <span key={t} className="flex items-center gap-1.5">
                                <Check size={13} className="text-success" />
                                {t}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Right: Vault visualization */}
                <div className="relative flex items-center justify-center h-[480px] select-none">

                    {/* Background glow */}
                    <div
                        className="absolute w-64 h-64 rounded-full blur-[80px] opacity-30"
                        style={{ background: 'radial-gradient(circle, oklch(var(--p)), transparent)' }}
                    />

                    {/* Pulse ring */}
                    <div
                        className="absolute w-36 h-36 rounded-full border-2 border-primary/30"
                        style={{ animation: 'pulse-ring 2.5s ease-out infinite' }}
                    />

                    {/* Outer rotating ring */}
                    <div
                        className="absolute w-72 h-72 rounded-full border border-dashed border-primary/20"
                        style={{ animation: 'spin-slow 25s linear infinite' }}
                    >
                        {[0, 90, 180, 270].map(deg => (
                            <span
                                key={deg}
                                className="absolute w-2.5 h-2.5 rounded-full bg-primary/60"
                                style={{
                                    top: '50%', left: '50%',
                                    transform: `rotate(${deg}deg) translateY(-144px) translate(-50%, -50%)`,
                                }}
                            />
                        ))}
                    </div>

                    {/* Inner ring (reverse) */}
                    <div
                        className="absolute w-52 h-52 rounded-full border border-base-300"
                        style={{ animation: 'spin-slow-reverse 18s linear infinite' }}
                    >
                        {[45, 135, 225, 315].map(deg => (
                            <span
                                key={deg}
                                className="absolute w-1.5 h-1.5 rounded-full bg-base-content/20"
                                style={{
                                    top: '50%', left: '50%',
                                    transform: `rotate(${deg}deg) translateY(-104px) translate(-50%, -50%)`,
                                }}
                            />
                        ))}
                    </div>

                    {/* Center shield */}
                    <div className="relative z-10 w-28 h-28 rounded-[2rem] bg-base-200 border border-base-300 shadow-2xl flex items-center justify-center">
                        <Shield size={52} className="text-primary" />
                    </div>

                    {/* Floating credential card 1 */}
                    <div
                        className="absolute top-10 right-6 bg-base-200/90 backdrop-blur-md border border-base-300 rounded-2xl p-3.5 shadow-xl w-48"
                        style={{ animation: 'float-a 4s ease-in-out infinite' }}
                    >
                        <div className="flex items-center gap-2.5 mb-2.5">
                            <div className="w-8 h-8 rounded-lg bg-[#24292e] flex items-center justify-center flex-shrink-0">
                                <Code2 size={16} className="text-white" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-semibold truncate">GitHub</p>
                                <p className="text-[10px] text-base-content/40 truncate">dev@studio.io</p>
                            </div>
                        </div>
                        <p className="text-xs font-mono text-base-content/25 tracking-wider">●●●●●●●●●●●</p>
                    </div>

                    {/* Floating credential card 2 */}
                    <div
                        className="absolute bottom-16 right-2 bg-base-200/90 backdrop-blur-md border border-base-300 rounded-2xl p-3.5 shadow-xl w-44"
                        style={{ animation: 'float-b 5s ease-in-out infinite 0.8s' }}
                    >
                        <div className="flex items-center gap-2.5 mb-2.5">
                            <div className="w-8 h-8 rounded-lg bg-[#ea4335] flex items-center justify-center flex-shrink-0">
                                <Mail size={16} className="text-white" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-semibold truncate">Gmail</p>
                                <p className="text-[10px] text-base-content/40 truncate">perso@gmail.com</p>
                            </div>
                        </div>
                        <p className="text-xs font-mono text-base-content/25 tracking-wider">●●●●●●●●●</p>
                    </div>

                    {/* Floating credential card 3 */}
                    <div
                        className="absolute top-20 left-4 bg-base-200/90 backdrop-blur-md border border-base-300 rounded-2xl p-3.5 shadow-xl w-44"
                        style={{ animation: 'float-c 4.5s ease-in-out infinite 1.5s' }}
                    >
                        <div className="flex items-center gap-2.5 mb-2.5">
                            <div className="w-8 h-8 rounded-lg bg-[#0070f3] flex items-center justify-center flex-shrink-0">
                                <Globe size={16} className="text-white" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-semibold truncate">Mon site</p>
                                <p className="text-[10px] text-base-content/40 truncate">admin</p>
                            </div>
                        </div>
                        <p className="text-xs font-mono text-base-content/25 tracking-wider">●●●●●●●●●●</p>
                    </div>

                    {/* Locked badge */}
                    <div className="absolute bottom-10 left-10 flex items-center gap-1.5 text-[10px] font-semibold text-success bg-success/10 border border-success/20 rounded-full px-3 py-1.5">
                        <Lock size={10} />
                        Coffre verrouillé
                    </div>

                </div>
            </section>

            {/* ── Marquee ── */}
            <div className="border-y border-base-200 py-4 overflow-hidden">
                <div
                    className="flex gap-10 whitespace-nowrap text-sm text-base-content/30 font-medium"
                    style={{ animation: 'marquee 22s linear infinite' }}
                >
                    {marqueeItems.map((item, i) => (
                        <span key={i} className="flex items-center gap-3 flex-shrink-0">
                            <span className="w-1 h-1 rounded-full bg-primary/40" />
                            {item}
                        </span>
                    ))}
                </div>
            </div>

            {/* ── Features ── */}
            <section className="max-w-6xl mx-auto px-6 py-24">
                <div className="mb-16">
                    <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-3">Fonctionnalités</p>
                    <h2 className="text-4xl font-black tracking-tight">Conçu pour la sécurité.</h2>
                </div>

                <div className="divide-y divide-base-200">
                    {features.map(({ number, icon: Icon, title, description }) => (
                        <div
                            key={number}
                            className="grid grid-cols-[auto_1fr_2fr] gap-10 py-10 items-start group"
                        >
                            <span className="text-5xl font-black text-base-content/8 group-hover:text-primary/20 transition-colors duration-500 w-16">
                                {number}
                            </span>
                            <div className="flex items-center gap-3 pt-1.5">
                                <div className="p-2.5 bg-primary/10 rounded-xl">
                                    <Icon size={20} className="text-primary" />
                                </div>
                                <h3 className="font-bold text-base leading-tight">{title}</h3>
                            </div>
                            <p className="text-base-content/50 leading-relaxed pt-1.5">{description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── CTA Banner ── */}
            <section className="mx-6 mb-16 rounded-3xl overflow-hidden relative"
                style={{ background: 'linear-gradient(135deg, oklch(var(--p)), oklch(var(--s)))' }}
            >
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
                        backgroundSize: '60px 60px',
                    }}
                />
                <div className="relative z-10 text-center py-20 px-6">
                    <h2 className="text-4xl md:text-5xl font-black text-primary-content mb-4 tracking-tight">
                        Votre coffre vous attend.
                    </h2>
                    <p className="text-primary-content/70 mb-10 text-lg">
                        Créez un compte en 30 secondes. Gratuit, pour toujours.
                    </p>
                    <Link
                        to="/signup"
                        className="btn btn-lg bg-base-100 text-base-content hover:bg-base-200 rounded-full px-10 gap-2 border-0 shadow-xl"
                    >
                        Commencer maintenant
                        <ArrowRight size={18} />
                    </Link>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="border-t border-base-200 py-8 px-6">
                <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-base-content/25">
                    <div className="flex items-center gap-2">
                        <Shield size={13} className="text-primary" />
                        <span className="font-semibold">Aether</span>
                        <span>· {new Date().getFullYear()}</span>
                    </div>
                    <span>Chiffrement de bout en bout · AES-256-CBC</span>
                </div>
            </footer>

        </div>
    )
}
