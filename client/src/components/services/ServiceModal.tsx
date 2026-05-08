import { useState, useEffect } from 'react'
import { Eye, EyeOff, Globe, User, Lock, Tag, FileText, X } from 'lucide-react'
import type { Service } from '../../types'
import PasswordGenerator from '../generator/PasswordGenerator.tsx'
import { getPasswordStrength } from '../../utils/passwordStrength'

interface Props {
    service?: Service | null
    onClose: () => void
    onSave: (data: Omit<Service, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void
}

const strengthColors = ['bg-error', 'bg-orange-400', 'bg-warning', 'bg-success']
const strengthLabels = ['Très faible', 'Faible', 'Moyen', 'Optimal']

export default function ServiceModal({ service, onClose, onSave }: Props) {
    const [form, setForm] = useState({ name: '', url: '', username: '', password: '', notes: '' })
    const [showPassword, setShowPassword] = useState(false)
    const [showGenerator, setShowGenerator] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (service) {
            setForm({
                name:     service.name,
                url:      service.url ?? '',
                username: service.username ?? '',
                password: service.password,
                notes:    service.notes ?? '',
            })
        }
    }, [service])

    function handleSave() {
        if (!form.name.trim() || !form.password.trim()) {
            setError('Nom et mot de passe sont obligatoires.')
            return
        }
        setError('')
        onSave(form)
    }

    const strength = getPasswordStrength(form.password)
    const strengthIndex = strengthLabels.indexOf(strength.label)

    return (
        <dialog className="modal modal-open">
            <div className="modal-box max-w-md p-0 overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-base-200">
                    <h3 className="font-black text-lg tracking-tight">
                        {service ? 'Modifier le service' : 'Nouveau service'}
                    </h3>
                    <button className="btn btn-ghost btn-sm btn-square" onClick={onClose}>
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">

                    {/* Name */}
                    <div className="form-control">
                        <label className="label py-1"><span className="label-text text-xs font-medium">Nom *</span></label>
                        <div className="relative">
                            <Tag size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/30 pointer-events-none" />
                            <input
                                type="text"
                                className="input input-bordered w-full pl-10"
                                placeholder="GitHub, Google, Netflix…"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* URL */}
                    <div className="form-control">
                        <label className="label py-1"><span className="label-text text-xs font-medium">URL</span></label>
                        <div className="relative">
                            <Globe size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/30 pointer-events-none" />
                            <input
                                type="text"
                                className="input input-bordered w-full pl-10"
                                placeholder="https://github.com"
                                value={form.url}
                                onChange={e => setForm({ ...form, url: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Username */}
                    <div className="form-control">
                        <label className="label py-1"><span className="label-text text-xs font-medium">Identifiant</span></label>
                        <div className="relative">
                            <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/30 pointer-events-none" />
                            <input
                                type="text"
                                className="input input-bordered w-full pl-10"
                                placeholder="john@example.com"
                                value={form.username}
                                onChange={e => setForm({ ...form, username: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="form-control">
                        <label className="label py-1"><span className="label-text text-xs font-medium">Mot de passe *</span></label>
                        <div className="relative">
                            <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/30 pointer-events-none" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="input input-bordered w-full pl-10 pr-11 font-mono"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                            />
                            <button
                                type="button"
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-base-content/30 hover:text-base-content transition-colors"
                                onClick={() => setShowPassword(v => !v)}
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                        </div>

                        {/* Strength */}
                        {form.password && (
                            <div className="mt-2.5 space-y-1.5">
                                <div className="flex gap-1">
                                    {strengthLabels.map((_, i) => (
                                        <div
                                            key={i}
                                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                                i <= strengthIndex ? (strengthColors[strengthIndex] ?? 'bg-base-300') : 'bg-base-300'
                                            }`}
                                        />
                                    ))}
                                </div>
                                <p className={`text-xs font-medium ${
                                    strengthIndex === 3 ? 'text-success' :
                                    strengthIndex === 2 ? 'text-warning' :
                                    strengthIndex === 1 ? 'text-orange-400' : 'text-error'
                                }`}>{strength.label}</p>
                            </div>
                        )}
                    </div>

                    {/* Generator toggle */}
                    <button
                        type="button"
                        className="btn btn-ghost btn-sm w-full border border-dashed border-base-300 rounded-xl gap-2 text-base-content/50"
                        onClick={() => setShowGenerator(v => !v)}
                    >
                        {showGenerator ? 'Masquer le générateur' : '✨ Générer un mot de passe'}
                    </button>

                    {showGenerator && (
                        <div className="bg-base-200 rounded-xl overflow-hidden border border-base-300">
                            <PasswordGenerator onUse={(pwd) => { setForm({ ...form, password: pwd }); setShowGenerator(false) }} />
                        </div>
                    )}

                    {/* Notes */}
                    <div className="form-control">
                        <label className="label py-1"><span className="label-text text-xs font-medium">Notes</span></label>
                        <div className="relative">
                            <FileText size={14} className="absolute left-3.5 top-3.5 text-base-content/30 pointer-events-none" />
                            <textarea
                                className="textarea textarea-bordered w-full pl-10 resize-none"
                                rows={2}
                                placeholder="Compte pro, 2FA activé…"
                                value={form.notes}
                                onChange={e => setForm({ ...form, notes: e.target.value })}
                            />
                        </div>
                    </div>

                    {error && <p className="text-error text-sm">{error}</p>}
                </div>

                {/* Footer */}
                <div className="flex gap-3 px-6 py-4 border-t border-base-200">
                    <button className="btn btn-ghost flex-1 rounded-xl" onClick={onClose}>
                        Annuler
                    </button>
                    <button className="btn btn-primary flex-1 rounded-xl" onClick={handleSave}>
                        {service ? 'Enregistrer' : 'Créer'}
                    </button>
                </div>

            </div>
            <div className="modal-backdrop" onClick={onClose} />
        </dialog>
    )
}
