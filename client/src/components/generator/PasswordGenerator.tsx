import { useState } from 'react'

export default function PasswordGenerator() {
    const [length, setLength] = useState(12)
    const [options, setOptions] = useState({
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: false,
})

    function toggleOption(key:keyof typeof options) {
        setOptions(prev => ({ ...prev, [key]: !prev[key] }))
    }

    return (
        <div className="flex flex-col gap-4 p-4">
            <h3 className="font-bold text-lg">Générateur de mot de passe</h3>

            {/* Taille */}
            <div className="flex flex-col gap-2">
                <div className="flex justify-between text-sm">
                    <span className="text-base-content/50">Taille</span>
                    <span className="font-mono font-bold">{length}</span>
                </div>
                <input
                    type="range"
                    min={8}
                    max={64}
                    value={length}
                    onChange={e => setLength(Number(e.target.value))}
                    className="range range-primary"
                />
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-2">
                {[
                    { key: 'uppercase', label: 'Majuscules (A-Z)' },
                    { key: 'lowercase', label: 'Minuscules (a-z)' },
                    { key: 'numbers',   label: 'Chiffres (0-9)' },
                    { key: 'symbols',   label: 'Symboles (!@#...)' },
                ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            className="checkbox checkbox-primary checkbox-sm"
                            checked={options[key as keyof typeof options]}
                            onChange={() => toggleOption(key as keyof typeof options)}
                        />
                        <span className="text-sm">{label}</span>
                    </label>
                ))
                }
            </div>

        </div>
    )
}