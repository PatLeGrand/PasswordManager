import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom"
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Layout from "./components/ui/Layout.tsx"
import ShareCreate from './pages/ShareCreate'
import ShareView from './pages/ShareView'
import Profile from './pages/Profile'
import Landing from './pages/Landing'
import Settings from './pages/settings/Settings'
import PasswordSettings from './pages/settings/PasswordSettings'
import MFAEmailSettings from './pages/settings/MFAEmailSettings'
import TOTPSettings from './pages/settings/TOTPSettings.tsx'
import SessionsSettings from './pages/settings/SessionsSettings'
import PasskeySettings from './pages/settings/PasskeySettings'
import { fetchWithAuth } from '../../server/src/lib/api.ts'
import { useState, useEffect } from 'react'

function PrivateRoute({ children }: { children: React.ReactNode }) {
    const token = localStorage.getItem('token')
    const [checking, setChecking] = useState(true)

    useEffect(() => {
        if (!token) return
        fetchWithAuth('/api/auth/me').finally(() => setChecking(false))
    }, [])

    if (!token) return <Navigate to="/login" />
    if (checking) return <span className="loading loading-spinner loading-lg" />

    return <>{children}</>
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/share/:token" element={<ShareView />} />  {/* ← ici, publique */}

                <Route
                    path="/"
                    element={
                        <PrivateRoute>
                            <Layout />
                        </PrivateRoute>
                    }
                >
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/share/create/:serviceId" element={<ShareCreate />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/settings/password" element={<PasswordSettings />} />
                    <Route path="/settings/mfa-email" element={<MFAEmailSettings />} />
                    <Route path="/settings/totp" element={<TOTPSettings />} />
                    <Route path="/settings/sessions" element={<SessionsSettings />} />
                    <Route path="/settings/passkey" element={<PasskeySettings />} />
                </Route>

                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </BrowserRouter>
    )
}