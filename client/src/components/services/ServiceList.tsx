import type { Service } from "../../types"
import ServiceCard from './ServiceCard'

interface Props {
    services: Service[]
    onEdit: (service: Service) => void
    onDelete: (id: string) => void
    onShare: (service: Service) => void
    onToast: (msg: string) => void
}

export default function ServiceList({ services, onEdit, onDelete, onShare, onToast }: Props) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {services.map(service => (
                <ServiceCard
                    key={service.id}
                    service={service}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onShare={onShare}
                    onToast={onToast}
                />
            ))}
        </div>
    )
}

