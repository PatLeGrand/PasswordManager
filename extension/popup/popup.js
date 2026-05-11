// ─── État global ─────────────────────────────────────────────────────────────

let currentEmail   = ''
let currentMethod  = ''
let allServices    = []
let currentDomain  = ''

// ─── Helpers UI ──────────────────────────────────────────────────────────────

function showView(id) {
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'))
    document.getElementById(id).classList.remove('hidden')
}

function showToast(msg, duration = 2000) {
    const toast = document.getElementById('toast')
    toast.textContent = msg
    toast.classList.remove('hidden')
    setTimeout(() => toast.classList.add('hidden'), duration)
}

function setLoading(btnId, loading) {
    const btn = document.getElementById(btnId)
    btn.querySelector('.btn-text').classList.toggle('hidden', loading)
    btn.querySelector('.spinner').classList.toggle('hidden', !loading)
    btn.disabled = loading
}

function setLoginError(msg) {
    const el = document.getElementById('login-error')
    if (msg) { el.textContent = msg; el.classList.remove('hidden') }
    else      { el.classList.add('hidden') }
}

// Couleur déterministe selon le nom du service
const COLORS = ['#7c3aed','#2563eb','#059669','#d97706','#dc2626','#7c3aed','#0891b2','#65a30d']
function avatarColor(name) {
    let h = 0
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0
    return COLORS[Math.abs(h) % COLORS.length]
}

// ─── Login flow ───────────────────────────────────────────────────────────────

document.getElementById('btn-login').addEventListener('click', handleLogin)
document.getElementById('login-password').addEventListener('keydown', e => {
    if (e.key === 'Enter') handleLogin()
})

async function handleLogin() {
    const email    = document.getElementById('login-email').value.trim()
    const password = document.getElementById('login-password').value
    if (!email || !password) return

    setLoginError('')
    setLoading('btn-login', true)

    const res = await browser.runtime.sendMessage({ type: 'LOGIN', email, password })

    setLoading('btn-login', false)

    if (res.success) {
        currentEmail = email
        await loadMain()
    } else if (res.mfaRequired) {
        currentEmail = email
        showMfaStep(res.methods)
    } else {
        setLoginError(res.message || 'Erreur de connexion')
    }
}

// ── MFA ───────────────────────────────────────────────────────────────────────

function showMfaStep(methods) {
    document.getElementById('step-credentials').classList.add('hidden')
    document.getElementById('step-mfa').classList.remove('hidden')

    currentMethod = methods[0] // on prend la première méthode disponible
    const hint = currentMethod === 'email'
        ? 'Entrez le code reçu par email.'
        : 'Entrez le code Google Authenticator.'
    document.getElementById('mfa-hint').textContent = hint
    document.getElementById('mfa-code').value = ''
    document.getElementById('mfa-code').focus()
}

document.getElementById('btn-verify-otp').addEventListener('click', handleVerifyOtp)
document.getElementById('mfa-code').addEventListener('keydown', e => {
    if (e.key === 'Enter') handleVerifyOtp()
})
document.getElementById('btn-mfa-back').addEventListener('click', async () => {
    await browser.runtime.sendMessage({ type: 'CLEAR_MFA_PENDING' })
    document.getElementById('step-mfa').classList.add('hidden')
    document.getElementById('step-credentials').classList.remove('hidden')
    setLoginError('')
})

async function handleVerifyOtp() {
    const code = document.getElementById('mfa-code').value.replace(/\D/g, '')
    if (code.length !== 6) return

    setLoading('btn-verify-otp', true)
    const res = await browser.runtime.sendMessage({
        type: 'VERIFY_OTP', email: currentEmail, code, method: currentMethod,
    })
    setLoading('btn-verify-otp', false)

    if (res.success) {
        await loadMain()
    } else {
        setLoginError(res.message || 'Code incorrect')
    }
}

// ─── Vue principale ───────────────────────────────────────────────────────────

async function loadMain() {
    showView('view-main')
    document.getElementById('loading-state').classList.remove('hidden')
    document.getElementById('list-all').innerHTML = ''
    document.getElementById('list-current').innerHTML = ''
    document.getElementById('section-current').classList.add('hidden')
    document.getElementById('empty-state').classList.add('hidden')

    // Nom de l'utilisateur
    const auth = await browser.runtime.sendMessage({ type: 'GET_AUTH_STATE' })
    if (auth.user) {
        document.getElementById('user-name').textContent =
            `${auth.user.firstName} ${auth.user.lastName}`
    }

    // Domaine de l'onglet courant
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
    if (tab?.url) {
        try { currentDomain = new URL(tab.url).hostname.replace(/^www\./, '') }
        catch { currentDomain = '' }
    }

    // Chargement des services
    const res = await browser.runtime.sendMessage({ type: 'GET_SERVICES' })
    document.getElementById('loading-state').classList.add('hidden')

    if (!res.success || !res.services.length) {
        document.getElementById('empty-state').classList.remove('hidden')
        return
    }

    allServices = res.services
    renderServices(allServices)
}

function renderServices(services) {
    // Services du site courant
    const matched = currentDomain
        ? services.filter(s => domainMatches(s.url, currentDomain))
        : []

    const sectionCurrent = document.getElementById('section-current')
    const listCurrent    = document.getElementById('list-current')
    listCurrent.innerHTML = ''

    if (matched.length > 0) {
        sectionCurrent.classList.remove('hidden')
        matched.forEach(s => listCurrent.appendChild(createServiceItem(s, true)))
    } else {
        sectionCurrent.classList.add('hidden')
    }

    // Tous les services
    const listAll = document.getElementById('list-all')
    listAll.innerHTML = ''

    const others = services.filter(s => !matched.includes(s))
    if (!others.length && !matched.length) {
        document.getElementById('empty-state').classList.remove('hidden')
        return
    }

    document.getElementById('empty-state').classList.add('hidden')
    others.forEach(s => listAll.appendChild(createServiceItem(s, false)))

    // Titre dynamique
    document.getElementById('title-all').textContent =
        matched.length > 0 ? 'Autres services' : 'Tous les services'
}

function domainMatches(serviceUrl, pageDomain) {
    if (!serviceUrl) return false
    try {
        const h = new URL(serviceUrl.startsWith('http') ? serviceUrl : `https://${serviceUrl}`)
                    .hostname.replace(/^www\./, '')
        return h === pageDomain || h.endsWith(`.${pageDomain}`) || pageDomain.endsWith(`.${h}`)
    } catch { return false }
}

function createServiceItem(service, canAutofill) {
    const li = document.createElement('li')
    li.className = 'service-item'

    const initial = (service.name?.[0] || '?').toUpperCase()
    const color   = avatarColor(service.name || '')

    li.innerHTML = `
        <div class="service-avatar" style="background:${color}">${initial}</div>
        <div class="service-info">
            <div class="service-name">${escHtml(service.name)}</div>
            <div class="service-user">${escHtml(service.username || '')}</div>
        </div>
        <div class="service-actions">
            <button class="action-btn copy-btn" title="Copier le mot de passe">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
            </button>
            ${canAutofill ? `
            <button class="action-btn autofill-btn" title="Remplir le formulaire">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                    <polyline points="9 11 12 14 22 4"/>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                </svg>
            </button>` : ''}
        </div>
    `

    // Copier le mot de passe
    li.querySelector('.copy-btn').addEventListener('click', async () => {
        await navigator.clipboard.writeText(service.password)
        showToast('✓ Mot de passe copié')
    })

    // Autofill
    if (canAutofill) {
        li.querySelector('.autofill-btn').addEventListener('click', async () => {
            await browser.runtime.sendMessage({
                type:     'AUTOFILL',
                username: service.username,
                password: service.password,
            })
            showToast('✓ Formulaire rempli')
            setTimeout(() => window.close(), 800)
        })
    }

    return li
}

function escHtml(str) {
    return (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
}

// ─── Recherche ────────────────────────────────────────────────────────────────

document.getElementById('search-input').addEventListener('input', e => {
    const q = e.target.value.toLowerCase().trim()
    const filtered = q
        ? allServices.filter(s =>
            s.name?.toLowerCase().includes(q) ||
            s.username?.toLowerCase().includes(q) ||
            s.url?.toLowerCase().includes(q)
          )
        : allServices
    renderServices(filtered)
})

// ─── Déconnexion ──────────────────────────────────────────────────────────────

document.getElementById('btn-logout').addEventListener('click', async () => {
    await browser.runtime.sendMessage({ type: 'LOGOUT' })
    showView('view-login')
    document.getElementById('login-password').value = ''
    setLoginError('')
})

// ─── Init ─────────────────────────────────────────────────────────────────────

async function init() {
    const { isAuthenticated, mfaPending } = await browser.runtime.sendMessage({ type: 'GET_AUTH_STATE' })

    if (isAuthenticated) {
        await loadMain()
    } else if (mfaPending) {
        // Le popup a été fermé pendant le MFA → on reprend là où on en était
        showView('view-login')
        currentEmail = mfaPending.email
        showMfaStep(mfaPending.methods)
    } else {
        showView('view-login')
    }
}

init()
