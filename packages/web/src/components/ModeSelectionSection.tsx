import { useState } from 'react';

export const ModeSelectionSection = (): JSX.Element => {
    const [mode, setMode] = useState<'encode' | 'decode' | 'audit'>('encode');

    return (
        <div className="flex gap-2 p-4 bg-neutral-900">
            <button
                onClick={() => setMode('encode')}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${mode === 'encode'
                        ? 'bg-red-600 text-white'
                        : 'bg-neutral-800 text-gray-400 hover:bg-neutral-700'
                    }`}
            >
                Encode
            </button>
            <button
                onClick={() => setMode('decode')}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${mode === 'decode'
                        ? 'bg-amber-500 text-white'
                        : 'bg-neutral-800 text-gray-400 hover:bg-neutral-700'
                    }`}
            >
                Decode
            </button>
            <button
                onClick={() => setMode('audit')}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${mode === 'audit'
                        ? 'bg-green-600 text-white'
                        : 'bg-neutral-800 text-gray-400 hover:bg-neutral-700'
                    }`}
            >
                Audit
            </button>
        </div>
    );
};

