import { useState } from 'react'
import { Eye, EyeOff, Copy, Pencil, Trash2 } from "lucide-react";
import type {Service} from "../../types";


interface Props {
    service: Service
    onEdit: (service: Service) => void
    onDelete: (id: String) => void
}

export default function ServiceCard({ service, onEdit, onDelete }: Props) {
    const [visible, setVisible] = useState<boolean>(false)
    const [copied, setCopied] = useState<boolean>(false)

    async function copyPassword(){
        await navigator.clipboard.writeText(service.password)
        setCopied(true)
        setTimeout(()=> setCopied(false), 2000)
    }

    return (
        <div className="card bg-base-200 border border-base-300 group">
            <div className="card-body p-5 gap-3">

                {/* Header carte */}
                <div className="flex items-center justify-between">
                    <h2 className="card-title text-base">{service.name}</h2>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="btn btn-ghost btn-xs btn-square" onClick={() => onEdit(service)}>
                            <Pencil size={13} />
                        </button>
                        <button className="btn btn-ghost btn-xs btn-square text-error" onClick={() => onDelete(service.id)}>
                            <Trash2 size={13} />
                        </button>
                    </div>
                </div>

                {service.url && (
                    <p className="text-xs text-base-content/50">{service.url}</p>
                )}

                {service.username && (
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-base-content/50">Identifiant</span>
                        <span>{service.username}</span>
                    </div>
                )}

                <div className="flex justify-between items-center text-sm">
                    <span className="text-base-content/50">Mot de passe</span>
                    <div className="flex items-center gap-1">
            <span className="font-mono text-xs bg-base-300 px-2 py-0.5 rounded">
              {visible ? service.password : '••••••••'}
            </span>
                        <button className="btn btn-ghost btn-xs btn-square" onClick={() => setVisible(!visible)}>
                            {visible ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                        <button className="btn btn-ghost btn-xs btn-square" onClick={copyPassword}>
                            {copied ? <span className="text-success text-xs">✓</span> : <Copy size={13} />}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    )
}