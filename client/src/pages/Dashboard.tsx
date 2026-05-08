import { useState, useEffect, useMemo } from 'react'
import { Plus, Search, KeyRound, ShieldAlert, SlidersHorizontal, Check } from 'lucide-react'
import type { Service } from '../types'
import ServiceList from '../components/services/ServiceList'
import * as serviceApi from '../services/serviceApi.ts'
import DeleteModal from '../components/services/DeleteModal'
import { useNavigate } from 'react-router-dom'
import { getPasswordStrength } from '../utils/passwordStrength'

type SortKey = 'name-asc' | 'name-desc' | 'date-desc' | 'strength'

const sortOptions: { value: SortKey; label: string }[] = [
    { value: 'name-asc',  label: 'A → Z' },
    { value: 'name-desc', label: 'Z → A' },
    { value: 'date-desc', label: 'Plus récent' },
    { value: 'strength',  label: 'Plus faible en premier' },
]

function getStrengthScore(password: string): number {
    const label = getPasswordStrength(password).label
    const map: Record<string, number> = { 'Très faible': 0, 'Faible': 1, 'Moyen': 2, 'Optimal': 3 }
    return map[label] ?? 3
}

export default function Dashboard() {
    const [services, setServices] = useState<Service[]>([])
    const [search, setSearch] = useState('')
    const [sort, setSort] = useState<SortKey>('name-asc')
    const [loading, setLoading] = useState(true)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [toast, setToast] = useState<string | null>(null)
    const navigate = useNavigate()

    const user = useMemo(() => {
        try { return JSON.parse(localStorage.getItem('user') || '{}') } catch { return {} }
    }, [])

    useEffect(() => { loadServices() }, [])

    async function loadServices() {
        setLoading(true)
        const data = await serviceApi.fetchServices()
        setServices(data)
        setLoading(false)
    }

    function showToast(msg: string) {
        setToast(msg)
        setTimeout(() => setToast(null), 2500)
    }

    const atRiskCount = useMemo(() => {
        const counts: Record<string, number> = {}
        services.forEach(s => { counts[s.password] = (counts[s.password] || 0) + 1 })
        return services.filter(s => {
            const score = getStrengthScore(s.password)
            return score <= 1 || counts[s.password] > 1
        }).length
    }, [services])

    const filtered = useMemo(() => {
        const q = search.toLowerCase()
        return services.filter(s =>
            s.name.toLowerCase().includes(q) ||
            s.username?.toLowerCase().includes(q) ||
            s.url?.toLowerCase().includes(q)
        )
    }, [services, search])

    const sorted = useMemo(() => {
        return [...filtered].sort((a, b) => {
            switch (sort) {
                case 'name-asc':  return a.name.localeCompare(b.name)
                case 'name-desc': return b.name.localeCompare(a.name)
                case 'date-desc': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                case 'strength':  return getStrengthScore(a.password) - getStrengthScore(b.password)
            }
        })
    }, [filtered, sort])

    function handleDelete(id: string) { setDeleteId(id) }
    function handleShare(service: Service) { navigate(`/share/create/${service.id}`) }

    async function handleConfirmDelete() {
        if (!deleteId) return
        await serviceApi.deleteService(deleteId)
        setServices(prev => prev.filter(s => s.id !== deleteId))
        setDeleteId(null)
        showToast('Service supprimé')
    }

    return (
        <div className="flex flex-col h-full">

            {/* ── Header ── */}
            <div className="px-8 pt-8 pb-6 border-b border-base-200">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">
                            Bonjour, {user.firstName || 'vous'} 👋
                        </h1>
                        <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-sm text-base-content/50">
                                {services.length} service{services.length !== 1 ? 's' : ''}
                            </span>
                            {atRiskCount > 0 && (
                                <span className="flex items-center gap-1.5 text-xs font-medium text-warning bg-warning/10 border border-warning/20 rounded-full px-2.5 py-0.5">
                                    <ShieldAlert size={11} />
                                    {atRiskCount} à risque
                                </span>
                            )}
                        </div>
                    </div>
                    <button
                        className="btn btn-primary gap-2 rounded-xl flex-shrink-0"
                        onClick={() => navigate('/services/new')}
                    >
                        <Plus size={16} />
                        Ajouter
                    </button>
                </div>

                {/* Search + Sort */}
                <div className="flex gap-3 mt-5">
                    <label className="input input-bordered flex items-center gap-2.5 flex-1">
                        <Search size={15} className="text-base-content/30 flex-shrink-0" />
                        <input
                            type="text"
                            placeholder="Nom, identifiant, URL…"
                            className="grow text-sm"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        {search && (
                            <button
                                className="text-base-content/30 hover:text-base-content transition-colors"
                                onClick={() => setSearch('')}
                            >
                                ✕
                            </button>
                        )}
                    </label>

                    <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn btn-outline gap-2 rounded-xl">
                            <SlidersHorizontal size={15} />
                            <span className="text-sm hidden sm:inline">
                                {sortOptions.find(o => o.value === sort)?.label}
                            </span>
                        </div>
                        <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-xl shadow-lg border border-base-200 w-52 mt-2 p-1 z-10">
                            {sortOptions.map(opt => (
                                <li key={opt.value}>
                                    <button
                                        className={`flex items-center justify-between rounded-lg text-sm ${sort === opt.value ? 'active' : ''}`}
                                        onClick={() => setSort(opt.value)}
                                    >
                                        {opt.label}
                                        {sort === opt.value && <Check size={13} />}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* ── Content ── */}
            <div className="flex-1 overflow-y-auto px-8 py-6">

                {loading && (
                    <div className="flex justify-center py-24">
                        <span className="loading loading-spinner loading-lg text-primary" />
                    </div>
                )}

                {!loading && services.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-28 text-center">
                        <div className="w-20 h-20 rounded-2xl bg-base-200 flex items-center justify-center mb-5">
                            <KeyRound size={36} strokeWidth={1.2} className="text-base-content/30" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">Votre coffre est vide</h2>
                        <p className="text-base-content/50 text-sm mb-6 max-w-xs">
                            Ajoutez votre premier mot de passe pour commencer à sécuriser vos accès.
                        </p>
                        <button
                            className="btn btn-primary gap-2 rounded-xl"
                            onClick={() => navigate('/services/new')}
                        >
                            <Plus size={16} />
                            Ajouter mon premier service
                        </button>
                    </div>
                )}

                {!loading && services.length > 0 && filtered.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <Search size={36} strokeWidth={1.2} className="text-base-content/20 mb-4" />
                        <p className="font-medium text-base-content/50">Aucun résultat pour « {search} »</p>
                        <button className="btn btn-ghost btn-sm mt-3" onClick={() => setSearch('')}>
                            Effacer la recherche
                        </button>
                    </div>
                )}

                {!loading && sorted.length > 0 && (
                    <ServiceList
                        services={sorted}
                        onEdit={s => navigate(`/services/${s.id}/edit`)}
                        onDelete={handleDelete}
                        onShare={handleShare}
                        onToast={showToast}
                    />
                )}
            </div>

            {deleteId && (
                <DeleteModal
                    onClose={() => setDeleteId(null)}
                    onConfirm={handleConfirmDelete}
                />
            )}

            {/* ── Toast ── */}
            {toast && (
                <div className="toast toast-top toast-end z-50">
                    <div className="alert alert-success shadow-lg py-3 gap-2">
                        <Check size={15} />
                        <span className="text-sm">{toast}</span>
                    </div>
                </div>
            )}

        </div>
    )
}
