import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Globe, User, Lock, Tag, FileText, Eye, EyeOff, Save } from 'lucide-react'
import * as serviceApi from '../services/serviceApi'
import PasswordGenerator from '../components/generator/PasswordGenerator'
import { getPasswordStrength } from '../utils/passwordStrength'
import type { Service } from '../types'

const strengthColors = ['bg-error', 'bg-orange-400', 'bg-warning', 'bg-success']
const strengthLabels = ['Très faible', 'Faible', 'Moyen', 'Optimal']

export default function ServiceForm() {
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()
    const isEdit = Boolean(id)

    const [form, setForm] = useState({ name: '', url: '', username: '', password: '', notes: '' })
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(isEdit)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!id) return
        serviceApi.fetchServices().then(services => {
            const found = services.find(s => s.id === id)
            if (found) {
                setForm({
                    name:     found.name,
                    url:      found.url ?? '',
                    username: found.username ?? '',
                    password: found.password,
                    notes:    found.notes ?? '',
                })
            } else {
                navigate('/dashboard')
            }
            setLoading(false)
        })
    }, [id])

    async function handleSave() {
        if (!form.name.trim() || !form.password.trim()) {
            setError('Le nom et le mot de passe sont obligatoires.')
            return
        }
        setSaving(true)
        setError('')
        try {
            if (isEdit && id) {
                await serviceApi.updateService(id, form)
            } else {
                await serviceApi.createService(form)
            }
            navigate('/dashboard')
        } catch {
            setError('Une erreur est survenue. Réessayez.')
            setSaving(false)
        }
    }

    const strength = getPasswordStrength(form.password)
    const strengthIndex = strengthLabels.indexOf(strength.label)

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <span className="loading loading-spinner loading-lg text-primary" />
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto px-8 py-8">

            {/* Header */}
            <div className="mb-8">
                <button
                    className="btn btn-ghost btn-sm gap-2 mb-6 -ml-2 text-base-content/60"
                    onClick={() => navigate('/dashboard')}
                >
                    <ArrowLeft size={16} />
                    Retour aux services
                </button>
                <h1 className="text-3xl font-black tracking-tight">
                    {isEdit ? `Modifier le service` : 'Nouveau service'}
                </h1>
                <p className="text-base-content/50 text-sm mt-1">
                    {isEdit ? 'Mettez à jour les informations de ce service.' : 'Ajoutez un nouveau mot de passe à votre coffre.'}
                </p>
            </div>

            {/* Content: two columns */}
            <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">

                {/* ── Left: form ── */}
                <div className="flex flex-col gap-5">

                    {error && (
                        <div className="alert alert-error py-3 text-sm">
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Name */}
                    <div className="form-control">
                        <label className="label py-1">
                            <span className="label-text font-medium text-sm">Nom du service *</span>
                        </label>
                        <div className="relative">
                            <Tag size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/30 pointer-events-none" />
                            <input
                                type="text"
                                className="input input-bordered w-full pl-11"
                                placeholder="GitHub, Google, Netflix…"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* URL */}
                    <div className="form-control">
                        <label className="label py-1">
                            <span className="label-text font-medium text-sm">URL</span>
                            <span className="label-text-alt text-base-content/30">Optionnel</span>
                        </label>
                        <div className="relative">
                            <Globe size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/30 pointer-events-none" />
                            <input
                                type="text"
                                className="input input-bordered w-full pl-11"
                                placeholder="https://github.com"
                                value={form.url}
                                onChange={e => setForm({ ...form, url: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Username */}
                    <div className="form-control">
                        <label className="label py-1">
                            <span className="label-text font-medium text-sm">Identifiant</span>
                            <span className="label-text-alt text-base-content/30">Optionnel</span>
                        </label>
                        <div className="relative">
                            <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/30 pointer-events-none" />
                            <input
                                type="text"
                                className="input input-bordered w-full pl-11"
                                placeholder="john@example.com"
                                value={form.username}
                                onChange={e => setForm({ ...form, username: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="form-control">
                        <label className="label py-1">
                            <span className="label-text font-medium text-sm">Mot de passe *</span>
                        </label>
                        <div className="relative">
                            <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/30 pointer-events-none" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="input input-bordered w-full pl-11 pr-12 font-mono"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
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
                            <div className="mt-3 space-y-1.5">
                                <div className="flex gap-1.5">
                                    {strengthLabels.map((_, i) => (
                                        <div
                                            key={i}
                                            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                                                i <= strengthIndex
                                                    ? (strengthColors[strengthIndex] ?? 'bg-base-300')
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
                                    Force : {strength.label}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Notes */}
                    <div className="form-control">
                        <label className="label py-1">
                            <span className="label-text font-medium text-sm">Notes</span>
                            <span className="label-text-alt text-base-content/30">Optionnel</span>
                        </label>
                        <div className="relative">
                            <FileText size={15} className="absolute left-4 top-3.5 text-base-content/30 pointer-events-none" />
                            <textarea
                                className="textarea textarea-bordered w-full pl-11 resize-none"
                                rows={3}
                                placeholder="Compte pro, 2FA activé…"
                                value={form.notes}
                                onChange={e => setForm({ ...form, notes: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            className="btn btn-ghost flex-1 rounded-xl"
                            onClick={() => navigate('/dashboard')}
                            disabled={saving}
                        >
                            Annuler
                        </button>
                        <button
                            className="btn btn-primary flex-1 rounded-xl gap-2"
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving
                                ? <span className="loading loading-spinner loading-sm" />
                                : <><Save size={15} /> {isEdit ? 'Enregistrer' : 'Créer le service'}</>
                            }
                        </button>
                    </div>
                </div>

                {/* ── Right: generator ── */}
                <div className="bg-base-200 rounded-2xl border border-base-300 overflow-hidden sticky top-8">
                    <div className="px-5 py-4 border-b border-base-300">
                        <p className="font-bold text-sm">Générateur de mot de passe</p>
                        <p className="text-xs text-base-content/40 mt-0.5">Créez un mot de passe fort instantanément</p>
                    </div>
                    <PasswordGenerator onUse={pwd => setForm({ ...form, password: pwd })} />
                </div>

            </div>
        </div>
    )
}
