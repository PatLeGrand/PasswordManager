import type { Service } from "../../types"
import ServiceCard from './ServiceCard'

interface Props {
    service: Service[],
    onEdit: (service: Service) => void,
    onDelete: (id: String) => void,
}

export default function ServiceList({ service, onEdit, onDelete }: Props) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {service.map(service => (
                <ServiceCard
                    key={service.id}
                    service={service}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    )
}

