import { useState, useEffect } from "react";
import type {Service} from "../../types";

interface Props {
    service?: Service | null
    onClose: () => void
    onSave: (data: Omit<Service, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void
}

export default function ServiceModal({ service, onClose, onSave }: Props) {
    const [form, setForm] = useState({
        name: "",
        url: "",
        username: "",
        password: "",
        notes: "",
    })

    const [error, setError] = useState('')

    useEffect(() => {
        if (service) {
            setForm({
                name: service.name,
                url: service.url ?? '',
                username: service.username ?? '',
                password: service.password,
                notes: service.notes ?? ''
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

    return (
        <dialog className="modal modal-open">
            <div className="modal-box max-w-md">

                <h3 className="font-bold text-lg mb-4">
                    {service ? 'Modifier le service' : 'Nouveau service'}
                </h3>

                <div className="flex flex-col gap-3">
                    <label className="form-control">
                        <div className="label"><span className="label-text">Nom *</span></div>
                        <input
                            type="text"
                            className="input input-bordered"
                            placeholder="GitHub, Google..."
                            value={form.name}
                            onChange={e => setForm({...form, name: e.target.value})}
                        />
                    </label>

                    <label className="form-control">
                        <div className="label"><span className="label-text">URL</span></div>
                        <input
                            type="text"
                            className="input input-bordered"
                            placeholder="https://github.com"
                            value={form.url}
                            onChange={e => setForm({...form, url: e.target.value})}
                        />
                    </label>

                    <label className="form-control">
                        <div className="label"><span className="label-text">Identifiant</span></div>
                        <input
                            type="text"
                            className="input input-bordered"
                            placeholder="john@example.com"
                            value={form.username}
                            onChange={e => setForm({...form, username: e.target.value})}
                        />
                    </label>

                    <label className="form-control">
                        <div className="label"><span className="label-text">Mot de passe *</span></div>
                        <input
                            type="text"
                            className="input input-bordered font-mono"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={e => setForm({...form, password: e.target.value})}
                        />
                    </label>

                    <label className="form-control">
                        <div className="label"><span className="label-text">Notes</span></div>
                        <textarea
                            className="textarea textarea-bordered resize-none"
                            rows={2}
                            placeholder="Compte pro, 2FA activé..."
                            value={form.notes}
                            onChange={e => setForm({...form, notes: e.target.value})}
                        />
                    </label>
                </div>

                {error && (
                    <p className="text-error text-sm mt-3">{error}</p>
                )}
                <div className="modal-action">
                    <button className="btn btn-ghost" onClick={onClose}>Annuler</button>
                    <button className="btn btn-primary" onClick={handleSave}>
                        {service ? 'Enregistrer' : 'Créer'}
                    </button>
                </div>

            </div>
            <div className="modal-backdrop" onClick={onClose}/>
        </dialog>
    )
}