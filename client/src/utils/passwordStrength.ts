
export function getPasswordStrength(password: string) {
    if (!password) return { label: '', color: '', width: '' }

    let score = 0
    if (password.length >= 8)  score++
    if (password.length >= 16) score++
    if (password.length >= 32) score++
    if (/[A-Z]/.test(password)) score++
    if (/[a-z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++

    if (score <= 2) return { label: 'Très faible', color: 'bg-error',      width: 'w-1/4' }
    if (score === 3) return { label: 'Faible',      color: 'bg-orange-400', width: 'w-2/4' }
    if (score <= 5)  return { label: 'Moyen',       color: 'bg-warning',    width: 'w-3/4' }
    return              { label: 'Optimal',      color: 'bg-success',    width: 'w-full' }
}