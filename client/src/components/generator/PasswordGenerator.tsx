import { useState} from 'react'
import { getPasswordStrength } from '../../utils/passwordStrength'
import {Copy} from "lucide-react";

interface Props {
    onUse?: (password: string) => void;
}

export default function PasswordGenerator({ onUse }: Props) {
    const [password, setPassword] = useState('')
    const [length, setLength] = useState(12)
    const [options, setOptions] = useState({
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: false,
    })

    const [copied, setCopied] = useState(false)

    function toggleOption(key:keyof typeof options) {
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

        let result = ''
        for (let i = 0; i < length; i++) {
            result += chars[Math.floor(Math.random() * chars.length)]
        }
        setPassword(result)
    }

    async function copyPassword() {
        if (!password) return
        await navigator.clipboard.writeText(password)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="flex flex-col gap-4 p-4">
            <h3 className="font-bold text-lg">Générateur de mot de passe</h3>

            {/* Taille */}
            <div className="flex flex-col gap-2">
                <div className="flex justify-between text-sm">
                    <span className="text-base-content/50">Taille</span>
                    <span className="font-mono font-bold">{length}</span>
                </div>
                <input
                    type="range"
                    min={8}
                    max={64}
                    value={length}
                    onChange={e => setLength(Number(e.target.value))}
                    className="range range-primary"
                />
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-2">
                {[
                    { key: 'uppercase', label: 'Majuscules (A-Z)' },
                    { key: 'lowercase', label: 'Minuscules (a-z)' },
                    { key: 'numbers',   label: 'Chiffres (0-9)' },
                    { key: 'symbols',   label: 'Symboles (!@#...)' },
                ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            className="checkbox checkbox-primary checkbox-sm"
                            checked={options[key as keyof typeof options]}
                            onChange={() => toggleOption(key as keyof typeof options)}
                        />
                        <span className="text-sm">{label}</span>
                    </label>
                ))
                }
            </div>
            <div className="flex items-center gap-2">
                <span className="font-mono text-sm bg-base-300 px-3 py-2 rounded flex-1 truncate">
                    {password || 'Cliquez sur Générer'}
                </span>
                <button className="btn btn-primary btn-sm" onClick={generate}>
                    Générer
                </button>
                <button className="btn btn-ghost btn-sm btn-square" onClick={copyPassword}>
                    {copied ? <span className="text-success text-xs">✓</span> : <Copy size={13} />}
                </button>
                {onUse && password && (
                    <button className="btn btn-success btn-sm" onClick={() => onUse(password)}>
                        Utiliser
                    </button>
                )}
            </div>

            {/* Barre de force */}
            {password && (() => {
                const strength = getPasswordStrength(password)
                return (
                    <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-xs">
                            <span className="text-base-content/50">Force</span>
                            <span>{strength.label}</span>
                        </div>
                        <div className="w-full h-2 bg-base-300 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${strength.color} ${strength.width}`} />
                        </div>
                    </div>
                )
            })()}

        </div>
    )
}