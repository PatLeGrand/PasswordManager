import type { Service } from "../types";
import { fetchWithAuth } from '../../../server/src/lib/api.ts'

export async function fetchServices(): Promise<Service[]> {
    const res = await fetchWithAuth('/api/services')
    return res.json()
}

export async function createService(data: Omit<Service, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Service> {
    const res = await fetchWithAuth('/api/services/', {
        method: 'POST',
        body: JSON.stringify(data),
    })
    return res.json()
}

export async function deleteService(id: string): Promise<void> {
    await fetchWithAuth(`/api/services/${id}`, {
        method: 'DELETE',
    })
}

export async function updateService(id: string, data: Omit<Service, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Service> {
    const res = await fetchWithAuth(`/api/services/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    })
    return res.json()
}