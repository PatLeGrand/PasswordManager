import { useNavigate, NavLink } from "react-router-dom";
import {KeyRound, Settings, LogOut, Shield} from "lucide-react";

export default function Sidebar() {
    const navigate = useNavigate();

    function handleLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    }

    return (
        <div className="flex flex-col w-64 min-h-screen bg-base-200 p-4 gap-2">
            {/* Logo */}
            <div className="flex items-center gap-2 p-4 mb-4">
                <Shield className="text-primary" size={28} />
                <span className="text-2xl font-bold">Aether</span>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-1 flex-1">
                <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                            isActive ? 'bg-primary text-primary-content' : 'hover:bg-base-300'
                        }`
                    }
                >
                    <KeyRound size={18} />
                    <span>Services</span>
                </NavLink>

                <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                            isActive ? 'bg-primary text-primary-content' : 'hover:bg-base-300'
                        }`
                    }
                >
                    <Settings size={18} />
                    <span>Paramètres</span>
                </NavLink>
            </nav>

            {/* Logout */}
            <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-error hover:text-error-content transition-colors"
            >
                <LogOut size={18} />
                <span>Déconnexion</span>
            </button>
        </div>
    )
}