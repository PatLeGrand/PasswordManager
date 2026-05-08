import { useState, useEffect } from 'react'
import { ArrowLeft, Pencil, Check, X, KeyRound, ShieldAlert, Calendar, LogOut, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { fetchWithAuth } from '../../../server/src/lib/api.ts'
import { getPasswordStrength } from '../utils/passwordStrength.ts'
import type { Service } from '../types/service.ts'

interface UserProfile {
    id: string
    email: string
    firstName: string
    lastName: string
    createdAt: string
}

interface Stats {
    total: number
    atRisk: number
    memberSince: string
}

function computeStats(services: Service[], createdAt: string): Stats {
    const counts: Record<string, number> = {}
    for (const s of services) counts[s.password] = (counts[s.password] || 0) + 1

    const atRisk = new Set(
        services
            .filter(s => {
                const { label } = getPasswordStrength(s.password)
                return label === 'Très faible' || label === 'Faible' || counts[s.password] > 1
            })
            .map(s => s.id)
    ).size

    return {
        total: services.length,
        atRisk,
        memberSince: new Date(createdAt).toLocaleDateString('fr-FR', {
            day: 'numeric', month: 'long', year: 'numeric',
        }),
    }
}

export default function Profile() {
    const navigate = useNavigate()
    const [user, setUser] = useState<UserProfile | null>(null)
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)

    const [editing, setEditing] = useState(false)
    const [form, setForm] = useState({ firstName: '', lastName: '' })
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)
    const [logoutAllLoading, setLogoutAllLoading] = useState(false)

    useEffect(() => {
        Promise.all([
            fetchWithAuth('/api/auth/me').then(r => r.json()),
            fetchWithAuth('/api/services').then(r => r.json()),
        ]).then(([userData, servicesData]: [UserProfile, Service[]]) => {
            setUser(userData)
            setForm({ firstName: userData.firstName, lastName: userData.lastName })
            setStats(computeStats(servicesData, userData.createdAt))
        }).finally(() => setLoading(false))
    }, [])

    function startEditing() {
        setEditing(true)
        setError('')
        setSuccess(false)
    }

    function cancelEditing() {
        if (!user) return
        setForm({ firstName: user.firstName, lastName: user.lastName })
        setEditing(false)
        setError('')
    }

    async function handleSave() {
        if (!form.firstName.trim() || !form.lastName.trim()) {
            setError('Prénom et nom requis.')
            return
        }
        setSaving(true)
        setError('')
        setSuccess(false)
        try {
            const res = await fetchWithAuth('/api/auth/profile', {
                method: 'PUT',
                body: JSON.stringify({ firstName: form.firstName, lastName: form.lastName }),
            })
            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.message || 'Erreur.')
            }
            const updated: UserProfile = await res.json()
            setUser(updated)
            setEditing(false)
            setSuccess(true)

            const stored = localStorage.getItem('user')
            if (stored) {
                const parsed = JSON.parse(stored)
                localStorage.setItem('user', JSON.stringify({ ...parsed, firstName: updated.firstName, lastName: updated.lastName }))
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erreur inconnue.')
        } finally {
            setSaving(false)
        }
    }

    async function handleLogoutAll() {
        setLogoutAllLoading(true)
        try {
            await fetchWithAuth('/api/auth/sessions', { method: 'DELETE' })
        } finally {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            navigate('/login')
        }
    }

    async function handleDeleteAccount() {
        setDeleteLoading(true)
        try {
            await fetchWithAuth('/api/auth/account', { method: 'DELETE' })
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            navigate('/login')
        } catch {
            setDeleteLoading(false)
            setShowDeleteModal(false)
        }
    }

    const initials = user
        ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
        : '?'

    const memberSince = user
        ? new Date(user.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
        : ''

    if (loading) {
        return (
            <div className="p-8 flex justify-center">
                <span className="loading loading-spinner loading-lg" />
            </div>
        )
    }

    return (
        <div className="p-8">

            <button className="btn btn-ghost gap-2 mb-10" onClick={() => navigate('/dashboard')}>
                <ArrowLeft size={18} />
                Retour
            </button>

            <div className="mb-10">
                <h1 className="text-3xl font-bold">Profil</h1>
                <p className="text-base-content/50 text-sm mt-1">
                    Gérez vos informations personnelles
                </p>
            </div>

            <div className="max-w-lg flex flex-col gap-8">

                {/* Avatar + nom */}
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-content text-2xl font-bold select-none">
                        {initials}
                    </div>
                    <div>
                        <p className="text-xl font-semibold">{user?.firstName} {user?.lastName}</p>
                        <p className="text-base-content/50 text-sm">{user?.email}</p>
                        <p className="text-base-content/40 text-xs mt-1">Membre depuis le {memberSince}</p>
                    </div>
                </div>

                <div className="divider my-0" />

                {/* Infos personnelles */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between mb-1">
                        <h2 className="font-semibold text-base">Informations personnelles</h2>
                        {!editing && (
                            <button className="btn btn-ghost btn-sm gap-2" onClick={startEditing}>
                                <Pencil size={15} />
                                Modifier
                            </button>
                        )}
                    </div>

                    <label className="form-control">
                        <div className="label pb-1">
                            <span className="label-text text-xs">Prénom</span>
                        </div>
                        <input
                            type="text"
                            className="input input-bordered w-full"
                            value={form.firstName}
                            onChange={e => setForm({ ...form, firstName: e.target.value })}
                            disabled={!editing}
                        />
                    </label>

                    <label className="form-control">
                        <div className="label pb-1">
                            <span className="label-text text-xs">Nom</span>
                        </div>
                        <input
                            type="text"
                            className="input input-bordered w-full"
                            value={form.lastName}
                            onChange={e => setForm({ ...form, lastName: e.target.value })}
                            disabled={!editing}
                        />
                    </label>

                    <label className="form-control">
                        <div className="label pb-1">
                            <span className="label-text text-xs">Adresse email</span>
                        </div>
                        <input
                            type="email"
                            className="input input-bordered w-full opacity-60"
                            value={user?.email ?? ''}
                            disabled
                        />
                    </label>

                    {error && <p className="text-error text-sm">{error}</p>}
                    {success && <p className="text-success text-sm">Profil mis à jour !</p>}

                    {editing && (
                        <div className="flex gap-3 mt-2">
                            <button
                                className="btn btn-primary flex-1 gap-2"
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving
                                    ? <span className="loading loading-spinner loading-sm" />
                                    : <><Check size={16} /> Enregistrer</>
                                }
                            </button>
                            <button
                                className="btn btn-ghost flex-1 gap-2"
                                onClick={cancelEditing}
                                disabled={saving}
                            >
                                <X size={16} />
                                Annuler
                            </button>
                        </div>
                    )}
                </div>

                <div className="divider my-0" />

                {/* Statistiques */}
                <div>
                    <h2 className="font-semibold text-base mb-4">Statistiques du compte</h2>
                    <div className="grid grid-cols-3 gap-4">

                        <div className="bg-base-200 rounded-xl p-4 flex flex-col gap-2">
                            <div className="p-2 bg-primary/10 rounded-lg w-fit">
                                <KeyRound size={18} className="text-primary" />
                            </div>
                            <p className="text-2xl font-bold">{stats?.total ?? 0}</p>
                            <p className="text-xs text-base-content/50 leading-tight">Mots de passe enregistrés</p>
                        </div>

                        <div className="bg-base-200 rounded-xl p-4 flex flex-col gap-2">
                            <div className="p-2 bg-warning/10 rounded-lg w-fit">
                                <ShieldAlert size={18} className="text-warning" />
                            </div>
                            <p className="text-2xl font-bold">{stats?.atRisk ?? 0}</p>
                            <p className="text-xs text-base-content/50 leading-tight">Faibles ou réutilisés</p>
                        </div>

                        <div className="bg-base-200 rounded-xl p-4 flex flex-col gap-2">
                            <div className="p-2 bg-primary/10 rounded-lg w-fit">
                                <Calendar size={18} className="text-primary" />
                            </div>
                            <p className="text-sm font-bold leading-tight mt-1">{stats?.memberSince ?? '—'}</p>
                            <p className="text-xs text-base-content/50 leading-tight">Membre depuis</p>
                        </div>

                    </div>
                </div>

                <div className="divider my-0" />

                {/* Danger zone */}
                <div>
                    <h2 className="font-semibold text-base mb-1">Zone de danger</h2>
                    <p className="text-xs text-base-content/50 mb-5">Ces actions sont irréversibles.</p>

                    <div className="flex flex-col gap-3">

                        <div className="flex items-center justify-between bg-base-200 rounded-xl px-5 py-4">
                            <div>
                                <p className="font-medium text-sm">Déconnexion de toutes les sessions</p>
                                <p className="text-xs text-base-content/50 mt-0.5">Révoque toutes les sessions actives</p>
                            </div>
                            <button
                                className="btn btn-outline btn-sm gap-2"
                                onClick={handleLogoutAll}
                                disabled={logoutAllLoading}
                            >
                                {logoutAllLoading
                                    ? <span className="loading loading-spinner loading-xs" />
                                    : <LogOut size={15} />
                                }
                                Se déconnecter
                            </button>
                        </div>

                        <div className="flex items-center justify-between bg-error/10 border border-error/20 rounded-xl px-5 py-4">
                            <div>
                                <p className="font-medium text-sm text-error">Supprimer le compte</p>
                                <p className="text-xs text-base-content/50 mt-0.5">Supprime définitivement vos données</p>
                            </div>
                            <button
                                className="btn btn-error btn-sm gap-2"
                                onClick={() => setShowDeleteModal(true)}
                            >
                                <Trash2 size={15} />
                                Supprimer
                            </button>
                        </div>

                    </div>
                </div>

            </div>

            {/* Modal confirmation suppression */}
            {showDeleteModal && (
                <dialog className="modal modal-open">
                    <div className="modal-box max-w-sm">
                        <h3 className="font-bold text-lg">Supprimer votre compte ?</h3>
                        <p className="text-base-content/60 text-sm mt-2">
                            Tous vos mots de passe, sessions et données seront définitivement supprimés.
                            Cette action est <span className="font-semibold text-error">irréversible</span>.
                        </p>
                        <div className="modal-action">
                            <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => setShowDeleteModal(false)}
                                disabled={deleteLoading}
                            >
                                Annuler
                            </button>
                            <button
                                className="btn btn-error btn-sm gap-2"
                                onClick={handleDeleteAccount}
                                disabled={deleteLoading}
                            >
                                {deleteLoading
                                    ? <span className="loading loading-spinner loading-xs" />
                                    : <Trash2 size={14} />
                                }
                                Supprimer définitivement
                            </button>
                        </div>
                    </div>
                    <div className="modal-backdrop" onClick={() => !deleteLoading && setShowDeleteModal(false)} />
                </dialog>
            )}

        </div>
    )
}
