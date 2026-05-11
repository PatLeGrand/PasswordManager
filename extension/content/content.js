// ─── Content script Aether ───────────────────────────────────────────────────
// Injecté sur toutes les pages web.
// Rôles :
//   1. Détecter les champs login/password
//   2. Afficher un bouton Aether sur les champs détectés
//   3. Afficher un dropdown de sélection de compte
//   4. Remplir le formulaire sur sélection ou commande du popup

;(function () {
    'use strict'

    // Évite l'injection double
    if (window.__aetherInjected) return
    window.__aetherInjected = true

    // ── Styles injectés ────────────────────────────────────────────────────────

    const STYLE = `
        .aether-btn {
            position: absolute;
            right: 8px;
            top: 50%;
            transform: translateY(-50%);
            width: 24px;
            height: 24px;
            background: #7c3aed;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2147483640;
            transition: background .15s, transform .1s;
            padding: 0;
        }
        .aether-btn:hover { background: #6d28d9; transform: translateY(-50%) scale(1.05); }
        .aether-btn svg   { pointer-events: none; }

        .aether-dropdown {
            position: absolute;
            z-index: 2147483641;
            background: #1a1a2e;
            border: 1px solid #2d3748;
            border-radius: 10px;
            box-shadow: 0 8px 32px rgba(0,0,0,.5);
            min-width: 260px;
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 13px;
            color: #e2e8f0;
        }
        .aether-dropdown-header {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 10px 14px;
            background: #16213e;
            border-bottom: 1px solid #2d3748;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: .06em;
            color: #94a3b8;
        }
        .aether-dropdown-header svg { color: #7c3aed; }
        .aether-credential {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 14px;
            cursor: pointer;
            transition: background .12s;
        }
        .aether-credential:hover { background: #16213e; }
        .aether-credential-avatar {
            width: 30px;
            height: 30px;
            border-radius: 7px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: 700;
            color: #fff;
            flex-shrink: 0;
        }
        .aether-credential-info { flex: 1; min-width: 0; }
        .aether-credential-name {
            font-weight: 600;
            font-size: 13px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .aether-credential-user {
            font-size: 11px;
            color: #94a3b8;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .aether-empty {
            padding: 14px;
            text-align: center;
            color: #94a3b8;
            font-size: 12px;
        }
    `

    const styleEl = document.createElement('style')
    styleEl.textContent = STYLE
    document.head.appendChild(styleEl)

    // ── Utilitaires ────────────────────────────────────────────────────────────

    const COLORS = ['#7c3aed','#2563eb','#059669','#d97706','#dc2626','#0891b2','#65a30d']
    function avatarColor(name) {
        let h = 0
        for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0
        return COLORS[Math.abs(h) % COLORS.length]
    }

    let activeDropdown = null

    function closeDropdown() {
        activeDropdown?.remove()
        activeDropdown = null
    }

    document.addEventListener('click', e => {
        if (!e.target.closest('.aether-dropdown') && !e.target.closest('.aether-btn')) {
            closeDropdown()
        }
    })

    // ── Trouver le champ username associé ──────────────────────────────────────

    function findUsernameField(passwordField) {
        const form = passwordField.closest('form') || document.body
        const inputs = Array.from(form.querySelectorAll('input'))
        const pwIdx  = inputs.indexOf(passwordField)

        // Cherche en arrière : email, text, ou tel avant le champ password
        for (let i = pwIdx - 1; i >= 0; i--) {
            const t = inputs[i].type
            if (['email', 'text', 'tel'].includes(t) && !inputs[i].hidden) {
                return inputs[i]
            }
        }
        return null
    }

    // ── Remplissage du formulaire ──────────────────────────────────────────────

    function fillForm(usernameField, passwordField, username, password) {
        function nativeSet(el, value) {
            const nativeSetter = Object.getOwnPropertyDescriptor(
                window.HTMLInputElement.prototype, 'value'
            )?.set
            nativeSetter?.call(el, value)
            el.dispatchEvent(new Event('input',  { bubbles: true }))
            el.dispatchEvent(new Event('change', { bubbles: true }))
        }
        if (usernameField && username) nativeSet(usernameField, username)
        if (passwordField && password) nativeSet(passwordField, password)
    }

    // ── Dropdown de sélection ──────────────────────────────────────────────────

    function showDropdown(anchor, services, passwordField, usernameField) {
        closeDropdown()

        const dropdown = document.createElement('div')
        dropdown.className = 'aether-dropdown'

        dropdown.innerHTML = `
            <div class="aether-dropdown-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                Aether — Comptes disponibles
            </div>
        `

        if (!services.length) {
            const empty = document.createElement('div')
            empty.className = 'aether-empty'
            empty.textContent = 'Aucun compte pour ce site.'
            dropdown.appendChild(empty)
        } else {
            services.forEach(service => {
                const item = document.createElement('div')
                item.className = 'aether-credential'
                const initial = (service.name?.[0] || '?').toUpperCase()
                const color   = avatarColor(service.name || '')

                item.innerHTML = `
                    <div class="aether-credential-avatar" style="background:${color}">${initial}</div>
                    <div class="aether-credential-info">
                        <div class="aether-credential-name">${escHtml(service.name)}</div>
                        <div class="aether-credential-user">${escHtml(service.username || '')}</div>
                    </div>
                `
                item.addEventListener('click', () => {
                    fillForm(usernameField, passwordField, service.username, service.password)
                    closeDropdown()
                })
                dropdown.appendChild(item)
            })
        }

        // Positionnement sous l'input
        document.body.appendChild(dropdown)
        activeDropdown = dropdown

        const rect = anchor.getBoundingClientRect()
        const scrollY = window.scrollY || document.documentElement.scrollTop
        const scrollX = window.scrollX || document.documentElement.scrollLeft

        dropdown.style.top  = `${rect.bottom + scrollY + 4}px`
        dropdown.style.left = `${rect.left  + scrollX}px`
    }

    function escHtml(str) {
        return (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    }

    // ── Bouton Aether sur les champs password ──────────────────────────────────

    const SHIELD_SVG = `
        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"
             stroke-linecap="round" stroke-linejoin="round" width="13" height="13">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
    `

    function attachButton(passwordField) {
        if (passwordField.dataset.aetherAttached) return
        passwordField.dataset.aetherAttached = 'true'

        // Wrapper pour positionner le bouton
        const parent = passwordField.parentElement
        const style  = getComputedStyle(parent)
        if (style.position === 'static') parent.style.position = 'relative'

        // Ajoute du padding à droite pour que le bouton ne chevauche pas le texte
        passwordField.style.paddingRight = '36px'

        const btn = document.createElement('button')
        btn.className = 'aether-btn'
        btn.type      = 'button'
        btn.title     = 'Remplir avec Aether'
        btn.innerHTML = SHIELD_SVG

        btn.addEventListener('click', async e => {
            e.stopPropagation()
            e.preventDefault()

            const domain   = window.location.hostname.replace(/^www\./, '')
            const response = await browser.runtime.sendMessage({
                type: 'GET_SERVICES_FOR_DOMAIN', domain,
            })

            const usernameField = findUsernameField(passwordField)
            showDropdown(
                passwordField,
                response.success ? response.services : [],
                passwordField,
                usernameField,
            )
        })

        parent.appendChild(btn)
    }

    // ── Écoute du message DO_AUTOFILL (depuis le popup) ───────────────────────

    browser.runtime.onMessage.addListener((message) => {
        if (message.type !== 'DO_AUTOFILL') return
        const pwField = document.querySelector('input[type="password"]')
        if (!pwField) return
        const userField = findUsernameField(pwField)
        fillForm(userField, pwField, message.username, message.password)
    })

    // ── Observation du DOM (SPA support) ──────────────────────────────────────

    function scanPasswordFields() {
        document.querySelectorAll('input[type="password"]').forEach(attachButton)
    }

    // Scan initial
    scanPasswordFields()

    // Observer les changements de DOM (frameworks SPA : React, Vue, Angular…)
    const observer = new MutationObserver(() => scanPasswordFields())
    observer.observe(document.body, { childList: true, subtree: true })

})()
