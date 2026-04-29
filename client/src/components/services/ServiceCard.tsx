import { useState } from 'react'
import { Eye, EyeOff, Copy, Pencil, Trash2, Share2 } from "lucide-react";
import type {Service} from "../../types";


interface Props {
    service: Service
    onEdit: (service: Service) => void
    onDelete: (id: string) => void
    onShare: (service: Service) => void
}

function getFavicon(url?: string) {
    if (!url) return null;
    try {
        const domain = new URL(url).hostname
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
    } catch  {
        return null
    }
}

export default function ServiceCard({ service, onEdit, onDelete, onShare }: Props) {
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
                    <div className="flex items-center gap-2">
                        {getFavicon(service.url) ? (
                            <img
                                src={getFavicon(service.url)!}
                                alt={service.name}
                                className="w-6 h-6 rounded"
                            />
                        ) : (
                            <div className="w-6 h-6 rounded bg-base-300 flex items-center justify-center text-xs font-bold">
                                {service.name.slice(0, 1).toUpperCase()}
                            </div>
                        )}
                        <h2 className="card-title text-base">{service.name}</h2>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="btn btn-ghost btn-xs btn-square" onClick={() => onShare(service)}>
                            <Share2 size={13} />
                        </button>
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