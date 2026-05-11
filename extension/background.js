const API_URL = 'http://localhost:3000'

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getToken() {
    const { token } = await browser.storage.local.get('token')
    return token || null
}

async function apiFetch(path, options = {}) {
    const token = await getToken()
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
    }
    return fetch(`${API_URL}${path}`, { ...options, headers })
}

// Extrait le hostname d'une URL pour la comparaison de domaines
function extractHostname(url) {
    if (!url) return ''
    try {
        const u = new URL(url.startsWith('http') ? url : `https://${url}`)
        return u.hostname.replace(/^www\./, '')
    } catch {
        return url.toLowerCase()
    }
}

// Vérifie si un service correspond au domaine courant
function matchesDomain(service, domain) {
    if (!service.url) return false
    const serviceHost = extractHostname(service.url)
    const pageHost    = domain.replace(/^www\./, '')
    return serviceHost === pageHost ||
           serviceHost.endsWith(`.${pageHost}`) ||
           pageHost.endsWith(`.${serviceHost}`)
}

// ─── Message handler ──────────────────────────────────────────────────────────

browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    handleMessage(message).then(sendResponse)
    return true // indique que la réponse est asynchrone
})

async function handleMessage(message) {
    switch (message.type) {

        // ── Authentification ──────────────────────────────────────────────────

        case 'LOGIN': {
            const res  = await apiFetch('/api/auth/login', {
                method: 'POST',
                body:   JSON.stringify({ email: message.email, password: message.password }),
            })
            const data = await res.json()

            if (res.ok && data.token) {
                await browser.storage.local.set({ token: data.token, user: data.user })
                return { success: true, user: data.user }
            }
            if (data.mfaRequired) {
                return { success: false, mfaRequired: true, methods: data.methods }
            }
            return { success: false, message: data.message || 'Erreur de connexion' }
        }

        case 'VERIFY_OTP': {
            const endpoint = message.method === 'totp'
                ? '/api/auth/verify-totp-login'
                : '/api/auth/verify-otp'
            const res  = await apiFetch(endpoint, {
                method: 'POST',
                body:   JSON.stringify({ email: message.email, code: message.code }),
            })
            const data = await res.json()

            if (res.ok && data.token) {
                await browser.storage.local.set({ token: data.token, user: data.user })
                return { success: true, user: data.user }
            }
            return { success: false, message: data.message || 'Code incorrect' }
        }

        case 'LOGOUT': {
            await browser.storage.local.remove(['token', 'user'])
            return { success: true }
        }

        case 'GET_AUTH_STATE': {
            const token        = await getToken()
            const { user }     = await browser.storage.local.get('user')
            return { isAuthenticated: !!token, user: user || null }
        }

        // ── Services ──────────────────────────────────────────────────────────

        case 'GET_SERVICES': {
            const res = await apiFetch('/api/services')
            if (!res.ok) return { success: false, services: [] }
            const services = await res.json()
            return { success: true, services }
        }

        case 'GET_SERVICES_FOR_DOMAIN': {
            const res = await apiFetch('/api/services')
            if (!res.ok) return { success: false, services: [] }
            const services = await res.json()
            const matched  = services.filter(s => matchesDomain(s, message.domain))
            return { success: true, services: matched }
        }

        // ── Autofill (délègue au content script) ──────────────────────────────

        case 'AUTOFILL': {
            const tabs = await browser.tabs.query({ active: true, currentWindow: true })
            if (!tabs[0]?.id) return { success: false }
            await browser.tabs.sendMessage(tabs[0].id, {
                type:     'DO_AUTOFILL',
                username: message.username,
                password: message.password,
            })
            return { success: true }
        }

        default:
            return { success: false, message: 'Type de message inconnu' }
    }
}
