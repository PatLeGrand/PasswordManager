const API_URL = 'http://localhost:3000'

export async function fetchWithAuth(path: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token') ?? ''

    const res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            ...options.headers,
        },
    })

    // 👇 Si session révoquée → déconnexion automatique
    if (res.status === 401) {
        localStorage.removeItem('token')
        window.location.href = '/login'
        return res
    }

    return res
}