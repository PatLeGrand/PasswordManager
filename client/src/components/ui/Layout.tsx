import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar'

export default function Layout() {
    const [open, setOpen] = useState(false)

    return (
        <div className="flex min-h-screen">

            {/* Mobile overlay */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 lg:hidden"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Sidebar — fixed on mobile, static on desktop */}
            <div className={`
                fixed inset-y-0 left-0 z-30 transition-transform duration-300 ease-in-out
                lg:static lg:z-auto lg:translate-x-0
                ${open ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <Sidebar onClose={() => setOpen(false)} />
            </div>

            {/* Content area */}
            <div className="flex flex-col flex-1 min-w-0">

                {/* Mobile top bar */}
                <header className="lg:hidden flex items-center gap-3 px-4 h-14 bg-base-200 border-b border-base-300 shrink-0">
                    <button
                        className="btn btn-ghost btn-sm btn-square"
                        onClick={() => setOpen(true)}
                    >
                        <Menu size={20} />
                    </button>
                    <img src="/Aether.png" className="w-5 h-5 object-contain" alt="Aether" />
                    <span className="font-bold text-lg">Aether</span>
                </header>

                <main className="flex-1 overflow-y-auto bg-base-100">
                    <Outlet />
                </main>

            </div>
        </div>
    )
}
