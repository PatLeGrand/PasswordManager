import { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { KeyRound, Settings, LogOut, Shield, User, Palette } from "lucide-react";

const themes = [
    { value: "light",   label: "Light" },
    { value: "dark",    label: "Dark" },
    { value: "luxury",  label: "Luxury" },
    { value: "black",   label: "Black" },
    { value: "retro",   label: "Retro" },
]

export default function Sidebar() {
    const navigate = useNavigate();
    const [currentTheme, setCurrentTheme] = useState(
        localStorage.getItem("theme") || "dark"
    );

    function applyTheme(theme: string) {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
        setCurrentTheme(theme);
    }

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
                    to="/profile"
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                            isActive ? 'bg-primary text-primary-content' : 'hover:bg-base-300'
                        }`
                    }
                >
                    <User size={18} />
                    <span>Profil</span>
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

            {/* Theme switcher */}
            <div className="dropdown dropdown-top">
                <div
                    tabIndex={0}
                    role="button"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-base-300 transition-colors cursor-pointer"
                >
                    <Palette size={18} />
                    <span className="flex-1">Thème</span>
                    <span className="text-xs text-base-content/40 capitalize">{currentTheme}</span>
                </div>
                <ul
                    tabIndex={0}
                    className="dropdown-content menu bg-base-100 rounded-xl shadow-lg border border-base-300 w-48 mb-2 p-1"
                >
                    {themes.map(t => (
                        <li key={t.value}>
                            <button
                                className={`flex items-center gap-3 rounded-lg ${currentTheme === t.value ? "active" : ""}`}
                                onClick={() => applyTheme(t.value)}
                            >
                                <span
                                    className="w-3 h-3 rounded-full border border-base-content/20"
                                    data-theme={t.value}
                                    style={{ background: "oklch(var(--p))" }}
                                />
                                {t.label}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

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