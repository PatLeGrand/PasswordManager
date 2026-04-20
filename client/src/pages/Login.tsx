import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import type {AuthResponse} from '../types'

export default function Login() {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const res = await api.post<AuthResponse>('/auth/login', { email, password })
            localStorage.setItem('token', res.data.token)
            localStorage.setItem('user', JSON.stringify(res.data.user))
            navigate('/dashboard')
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erreur serveur')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-base-200 flex items-center justify-center">
            <div className="card w-96 bg-base-100 shadow-xl">
                <div className="card-body">
                    <h1 className="text-3xl font-bold text-center mb-2">Aether</h1>
                    <p className="text-center text-base-content/60 mb-6">Connectez-vous à votre coffre</p>

                    {error && (
                        <div className="alert alert-error mb-4">
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <label className="form-control">
                            <div className="label">
                                <span className="label-text">Email</span>
                            </div>
                            <input
                                type="email"
                                placeholder="vous@exemple.com"
                                className="input input-bordered w-full"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </label>

                        <label className="form-control">
                            <div className="label">
                                <span className="label-text">Mot de passe</span>
                            </div>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="input input-bordered w-full"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                        </label>

                        <button
                            type="submit"
                            className="btn btn-primary w-full mt-2"
                            disabled={loading}
                        >
                            {loading ? <span className="loading loading-spinner" /> : 'Se connecter'}
                        </button>
                    </form>

                    <p className="text-center text-sm mt-4">
                        Pas encore de compte ?{' '}
                        <Link to="/signup" className="link link-primary">
                            S'inscrire
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}