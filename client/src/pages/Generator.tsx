import { useState } from 'react'
import { Copy, Check, RefreshCw, Wand2 } from 'lucide-react'
import { getPasswordStrength } from '../utils/passwordStrength'

const OPTIONS = [
    { key: 'uppercase', label: 'Majuscules', sublabel: 'A-Z' },
    { key: 'lowercase', label: 'Minuscules', sublabel: 'a-z' },
    { key: 'numbers',   label: 'Chiffres',   sublabel: '0-9' },
    { key: 'symbols',   label: 'Symboles',   sublabel: '!@#...' },
]

export default function Generator() {
    const [length, setLength]   = useState(16)
    const [options, setOptions] = useState({
        uppercase: true,
        lowercase: true,
        numbers:   true,
        symbols:   false,
    })
    const [password, setPassword] = useState('')
    const [copied, setCopied]     = useState(false)

    function toggle(key: keyof typeof options) {
        setOptions(prev => ({ ...prev, [key]: !prev[key] }))
    }

    function generate() {
        const chars = [
            options.uppercase ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : '',
            options.lowercase ? 'abcdefghijklmnopqrstuvwxyz' : '',
            options.numbers   ? '0123456789' : '',
            options.symbols   ? '!@#$%^&*()_+-=[]{}|;:,.<>?' : '',
        ].join('')
        if (!chars) return
        const arr = Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)])
        setPassword(arr.join(''))
        setCopied(false)
    }

    async function copy() {
        if (!password) return
        await navigator.clipboard.writeText(password)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const strength = password ? getPasswordStrength(password) : null

    return (
        <div className="p-8 max-w-2xl mx-auto">

            <div className="mb-10">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Wand2 size={28} className="text-primary" />
                    Générateur
                </h1>
                <p className="text-base-content/50 text-sm mt-1">
                    Créez des mots de passe forts et aléatoires.
                </p>
            </div>

            <div className="flex flex-col gap-6">

                {/* Mot de passe généré */}
                <div className="bg-base-200 rounded-2xl p-6 flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <span className={`font-mono text-xl flex-1 tracking-widest break-all ${!password ? 'text-base-content/30' : ''}`}>
                            {password || '••••••••••••••••'}
                        </span>
                        <button
                            className="btn btn-ghost btn-sm btn-square"
                            onClick={copy}
                            disabled={!password}
                            title="Copier"
                        >
                            {copied
                                ? <Check size={16} className="text-success" />
                                : <Copy size={16} />
                            }
                        </button>
                    </div>

                    {/* Barre de force */}
                    {strength && (
                        <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between text-xs">
                                <span className="text-base-content/50">Force</span>
                                <span className="font-medium">{strength.label}</span>
                            </div>
                            <div className="w-full h-2 bg-base-300 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full transition-all duration-500 ${strength.color} ${strength.width}`} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Longueur */}
                <div className="bg-base-200 rounded-2xl p-6 flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-sm">Longueur</span>
                        <span className="font-mono font-bold text-primary text-lg">{length}</span>
                    </div>
                    <input
                        type="range"
                        min={8}
                        max={64}
                        value={length}
                        onChange={e => setLength(Number(e.target.value))}
                        className="range range-primary"
                    />
                    <div className="flex justify-between text-xs text-base-content/30">
                        <span>8</span>
                        <span>64</span>
                    </div>
                </div>

                {/* Options */}
                <div className="bg-base-200 rounded-2xl p-6">
                    <p className="font-semibold text-sm mb-4">Caractères inclus</p>
                    <div className="grid grid-cols-2 gap-3">
                        {OPTIONS.map(({ key, label, sublabel }) => (
                            <label
                                key={key}
                                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all ${
                                    options[key as keyof typeof options]
                                        ? 'border-primary bg-primary/10'
                                        : 'border-base-300 hover:border-base-content/20'
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    className="checkbox checkbox-primary checkbox-sm"
                                    checked={options[key as keyof typeof options]}
                                    onChange={() => toggle(key as keyof typeof options)}
                                />
                                <div>
                                    <p className="text-sm font-medium leading-tight">{label}</p>
                                    <p className="text-xs text-base-content/40 font-mono">{sublabel}</p>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Bouton générer */}
                <button
                    className="btn btn-primary w-full gap-2 text-base"
                    onClick={generate}
                >
                    <RefreshCw size={18} />
                    Générer un mot de passe
                </button>

            </div>
        </div>
    )
}
