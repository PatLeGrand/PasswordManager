import type { Service } from "../types";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function getToken() {
    return localStorage.getItem("token") ?? ''
}

const headers = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
})

export async function fetchServices(): Promise<Service[]> {
    const res = await fetch(`${API_URL}/api/services`, { headers: headers() })
    return res.json()
}
export async function createService (data: Omit<Service, 'id' | 'userId' | 'createdAt' | 'updatedAt' >) : Promise<Service> {
    const res = await fetch(`${API_URL}/api/services/`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(data),
    })
    return res.json()
}

export async function deleteService (id: string) : Promise<void> {
    await fetch(`${API_URL}/api/services/${id}`, {
        method: 'DELETE',
        headers: headers(),
    })
}

export async function updateService(id: string, data: Omit<Service, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Service> {
    const res = await fetch(`${API_URL}/api/services/${id}`, {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify(data),
    })
    return res.json()
}

