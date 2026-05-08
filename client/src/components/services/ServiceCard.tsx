import { useState } from 'react'
import { Eye, EyeOff, Copy, Pencil, Trash2, Share2, ExternalLink, Check, User } from 'lucide-react'
import type { Service } from '../../types'
import { getPasswordStrength } from '../../utils/passwordStrength'

interface Props {
    service: Service
    onEdit: (service: Service) => void
    onDelete: (id: string) => void
    onShare: (service: Service) => void
    onToast: (msg: string) => void
}

function getFavicon(url?: string) {
    if (!url) return null
    try {
        const domain = new URL(url).hostname
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
    } catch {
        return null
    }
}

const avatarColors = [
    'bg-primary text-primary-content',
    'bg-secondary text-secondary-content',
    'bg-accent text-accent-content',
    'bg-info text-info-content',
    'bg-success text-success-content',
    'bg-warning text-warning-content',
]

function getAvatarColor(name: string): string {
    let hash = 0
    for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i)
    return avatarColors[hash % avatarColors.length]
}

const strengthDot: Record<string, string> = {
    'Très faible': 'bg-error',
    'Faible':      'bg-orange-400',
    'Moyen':       'bg-warning',
    'Optimal':     'bg-success',
}

export default function ServiceCard({ service, onEdit, onDelete, onShare, onToast }: Props) {
    const [visible, setVisible] = useState(false)
    const [copiedPwd, setCopiedPwd] = useState(false)
    const [copiedUser, setCopiedUser] = useState(false)

    const favicon = getFavicon(service.url)
    const strength = getPasswordStrength(service.password)
    const dotColor = strengthDot[strength.label] ?? 'bg-success'

    async function copyPassword() {
        await navigator.clipboard.writeText(service.password)
        setCopiedPwd(true)
        setTimeout(() => setCopiedPwd(false), 2000)
        onToast('Mot de passe copié')
    }

    async function copyUsername() {
        if (!service.username) return
        await navigator.clipboard.writeText(service.username)
        setCopiedUser(true)
        setTimeout(() => setCopiedUser(false), 2000)
        onToast('Identifiant copié')
    }

    return (
        <div className="card bg-base-200 border border-base-300 hover:border-primary/30 hover:shadow-md transition-all duration-200 flex flex-col">
            <div className="card-body p-5 gap-0 flex flex-col flex-1">

                {/* ── Top: avatar + name + strength ── */}
                <div className="flex items-start gap-3 mb-4">
                    <div className="flex-shrink-0">
                        {favicon ? (
                            <img
                                src={favicon}
                                alt={service.name}
                                className="w-10 h-10 rounded-xl object-contain bg-base-100 p-1 border border-base-300"
                                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                            />
                        ) : (
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black ${getAvatarColor(service.name)}`}>
                                {service.name.slice(0, 1).toUpperCase()}
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <h2 className="font-bold text-base leading-tight truncate">{service.name}</h2>
                        {service.url ? (
                            <a
                                href={service.url.startsWith('http') ? service.url : `https://${service.url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs text-base-content/40 hover:text-primary transition-colors mt-0.5 group w-fit max-w-full"
                            >
                                <span className="truncate">{new URL(service.url.startsWith('http') ? service.url : `https://${service.url}`).hostname}</span>
                                <ExternalLink size={10} className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                        ) : (
                            <p className="text-xs text-base-content/30 mt-0.5">Aucune URL</p>
                        )}
                    </div>

                    <div
                        className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${dotColor}`}
                        title={`Force : ${strength.label}`}
                    />
                </div>

                {/* ── Fields ── */}
                <div className="flex flex-col gap-2 flex-1">

                    {/* Username */}
                    <div className="flex items-center gap-2 bg-base-100 rounded-lg px-3 py-2">
                        <User size={13} className="text-base-content/30 flex-shrink-0" />
                        <span className="text-sm text-base-content/70 flex-1 truncate min-w-0">
                            {service.username || <span className="text-base-content/30 italic">Aucun identifiant</span>}
                        </span>
                        {service.username && (
                            <button
                                className="btn btn-ghost btn-xs btn-square flex-shrink-0"
                                onClick={copyUsername}
                                title="Copier l'identifiant"
                            >
                                {copiedUser ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                            </button>
                        )}
                    </div>

                    {/* Password */}
                    <div className="flex items-center gap-2 bg-base-100 rounded-lg px-3 py-2">
                        <span className="font-mono text-sm flex-1 truncate text-base-content/70">
                            {visible ? service.password : '••••••••••'}
                        </span>
                        <button
                            className="btn btn-ghost btn-xs btn-square flex-shrink-0"
                            onClick={() => setVisible(v => !v)}
                            title={visible ? 'Masquer' : 'Afficher'}
                        >
                            {visible ? <EyeOff size={12} /> : <Eye size={12} />}
                        </button>
                        <button
                            className="btn btn-ghost btn-xs btn-square flex-shrink-0"
                            onClick={copyPassword}
                            title="Copier le mot de passe"
                        >
                            {copiedPwd ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                        </button>
                    </div>
                </div>

                {/* ── Strength bar ── */}
                <div className="mt-3 mb-4">
                    <div className="flex gap-1">
                        {['Très faible', 'Faible', 'Moyen', 'Optimal'].map((lvl, i) => {
                            const currentIndex = ['Très faible', 'Faible', 'Moyen', 'Optimal'].indexOf(strength.label)
                            const colors = ['bg-error', 'bg-orange-400', 'bg-warning', 'bg-success']
                            return (
                                <div
                                    key={lvl}
                                    className={`h-1 flex-1 rounded-full transition-all ${i <= currentIndex ? (colors[currentIndex] ?? 'bg-base-300') : 'bg-base-300'}`}
                                />
                            )
                        })}
                    </div>
                </div>

                {/* ── Actions ── */}
                <div className="flex items-center gap-1 pt-3 border-t border-base-300">
                    <button
                        className="btn btn-ghost btn-sm gap-1.5 flex-1 text-base-content/60 hover:text-base-content rounded-lg text-xs"
                        onClick={() => onShare(service)}
                    >
                        <Share2 size={13} />
                        Partager
                    </button>
                    <button
                        className="btn btn-ghost btn-sm gap-1.5 flex-1 text-base-content/60 hover:text-base-content rounded-lg text-xs"
                        onClick={() => onEdit(service)}
                    >
                        <Pencil size={13} />
                        Modifier
                    </button>
                    <button
                        className="btn btn-ghost btn-sm gap-1.5 flex-1 text-error/60 hover:text-error rounded-lg text-xs"
                        onClick={() => onDelete(service.id)}
                    >
                        <Trash2 size={13} />
                        Suppr.
                    </button>
                </div>

            </div>
        </div>
    )
}
