import { useState, useEffect } from 'react'
import { Plus, Search, KeyRound } from 'lucide-react'
import type { Service } from '../types'
import ServiceList from '../components/services/ServiceList'
import ServiceModal from '../components/services/ServiceModal'
import * as serviceApi from '../services/serviceApi.ts'
import DeleteModal from '../components/services/DeleteModal'

export default function Dashboard() {
    const [services, setServices] = useState<Service[]>([])
    const [search, setSearch] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [editingService, setEditingService] = useState<Service | null>(null)
    const [loading, setLoading] = useState(true)
    const [deleteId, setDeleteId] = useState<string | null>(null)

    useEffect(() => {
        loadServices()
    }, [])

    async function loadServices() {
        setLoading(true)
        const data = await serviceApi.fetchServices()
        setServices(data)
        setLoading(false)
    }

    const filtered = services.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase())
    )

    function handleEdit(service: Service) {
        setEditingService(service)
        setShowModal(true)
    }

    function handleDelete(id: string) {
        setDeleteId(id)
    }

    async function handleConfirmDelete() {
        if (!deleteId) return
        await serviceApi.deleteService(deleteId)
        setServices(prev => prev.filter(s => s.id !== deleteId))
        setDeleteId(null)
    }

    function handleClose() {
        setShowModal(false)
        setEditingService(null)
    }

    async function handleSave(data: Omit<Service, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) {
        if (editingService) {
            const updated = await serviceApi.updateService(editingService.id, data)
            setServices(prev => prev.map(s => s.id === editingService.id ? updated : s))
        } else {
            const created = await serviceApi.createService(data)
            setServices(prev => [...prev, created])
        }
        handleClose()
    }

    return (
        <div className="max-w-5xl mx-auto">

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Services</h1>
                    <p className="text-base-content/50 text-sm mt-0.5">{services.length} mots de passe enregistrés</p>
                </div>
                <button className="btn btn-primary gap-2" onClick={() => setShowModal(true)}>
                    <Plus size={16} />
                    Ajouter
                </button>
            </div>

            <label className="input input-bordered flex items-center gap-2 mb-6">
                <Search size={16} className="text-base-content/40" />
                <input
                    type="text"
                    placeholder="Rechercher un service..."
                    className="grow"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </label>

            {loading && (
                <div className="flex justify-center py-24">
                    <span className="loading loading-spinner loading-lg text-primary" />
                </div>
            )}

            {!loading && filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-base-content/40">
                    <KeyRound size={48} strokeWidth={1.2} className="mb-4" />
                    <p className="text-lg font-medium">Aucun service enregistré</p>
                    <p className="text-sm mt-1">Cliquez sur "Ajouter" pour commencer.</p>
                </div>
            )}

            {!loading && filtered.length > 0 && (
                <ServiceList
                    services={filtered}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}

            {showModal && (
                <ServiceModal
                    service={editingService}
                    onClose={handleClose}
                    onSave={handleSave}
                />
            )}

            {deleteId && (
                <DeleteModal
                    onClose= { () => setDeleteId(null) }
                    onConfirm={handleConfirmDelete}
                />
            )

            }

        </div>
    )
}