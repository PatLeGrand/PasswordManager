import { useState } from 'react'
import { Plus, Search, KeyRound } from 'lucide-react'
import ServiceList from "../components/services/ServiceList.tsx";
import ServiceModal from "../components/services/ServiceModal.tsx";
import type { Service } from "../types";

const fakeServices: Service[] = [
    { id: '1', userId: '1', name: 'GitHub', url: 'https://github.com', username: 'johndoe', password: 'MonMotDePasse123!', createdAt: '', updatedAt: '' },
    { id: '2', userId: '1', name: 'Google', url: 'https://google.com', username: 'john@gmail.com', password: 'Google456!', createdAt: '', updatedAt: '' },
    { id: '3', userId: '1', name: 'Netflix', url: 'https://netflix.com', username: 'john@gmail.com', password: 'Netflix789!', createdAt: '', updatedAt: '' },
]

export default function Dashboard() {
    const [services, setServices] = useState<Service[]>(fakeServices)
    const [search, setSearch] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [editingService, setEditingService] = useState<Service | null>(null)

    const filtered = services.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase())
    )
     function handleEdit(service: Service) {
        setEditingService(service)
        setShowModal(true)
     }

     function handleDelete(id: String) {
        setServices(prev => prev.filter(s => s.id !== id))
     }

     function handleClose() {
        setShowModal(false)
         setEditingService(null)
     }

     function handleSave(data: Omit<Service, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) {
        if (editingService) {
            setServices (prev => prev.map(s =>
                s.id === editingService.id? {...s, ...data} : s
            ))
        } else {
            const newService : Service = {
                ...data,
                id: crypto.randomUUID(),
                userId: '1',
                createdAt: '',
                updatedAt: '',
            }
            setServices(prev => [...prev, newService])
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

            {filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-base-content/40">
                    <KeyRound size={48} strokeWidth={1.2} className="mb-4" />
                    <p className="text-lg font-medium">Aucun service enregistré</p>
                    <p className="text-sm mt-1">Cliquez sur "Ajouter" pour commencer.</p>
                </div>
            )}

            {filtered.length > 0 && (
                <ServiceList
                    service={filtered}
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

        </div>
    )
}
