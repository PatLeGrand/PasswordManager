import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'

export default function Signup() {
    const navigate = useNavigate()
    const [form, setForm] = useState({
        email: '',
        firstName: '',
        lastName: '',
        password: '',
    })
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError('')
        setSuccess('')

        try {
            await api.post('/auth/signup', form)
            setSuccess('Compte créé ! Vérifiez votre email avant de vous connecter.')
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
                    <p className="text-center text-base-content/60 mb-6">Créez votre coffre</p>

                    {error && (
                        <div className="alert alert-error mb-4">
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="alert alert-success mb-4">
                            <span>{success}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <label className="form-control">
                            <div className="label">
                                <span className="label-text">Prénom</span>
                            </div>
                            <input
                                type="text"
                                name="firstName"
                                placeholder="John"
                                className="input input-bordered w-full"
                                value={form.firstName}
                                onChange={handleChange}
                                required
                            />
                        </label>

                        <label className="form-control">
                            <div className="label">
                                <span className="label-text">Nom</span>
                            </div>
                            <input
                                type="text"
                                name="lastName"
                                placeholder="Doe"
                                className="input input-bordered w-full"
                                value={form.lastName}
                                onChange={handleChange}
                                required
                            />
                        </label>

                        <label className="form-control">
                            <div className="label">
                                <span className="label-text">Email</span>
                            </div>
                            <input
                                type="email"
                                name="email"
                                placeholder="vous@exemple.com"
                                className="input input-bordered w-full"
                                value={form.email}
                                onChange={handleChange}
                                required
                            />
                        </label>

                        <label className="form-control">
                            <div className="label">
                                <span className="label-text">Mot de passe</span>
                            </div>
                            <input
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                className="input input-bordered w-full"
                                value={form.password}
                                onChange={handleChange}
                                required
                            />
                        </label>

                        <button
                            type="submit"
                            className="btn btn-primary w-full mt-2"
                            disabled={loading}
                        >
                            {loading ? <span className="loading loading-spinner" /> : "S'inscrire"}
                        </button>
                    </form>

                    <p className="text-center text-sm mt-4">
                        Déjà un compte ?{' '}
                        <Link to="/login" className="link link-primary">
                            Se connecter
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}