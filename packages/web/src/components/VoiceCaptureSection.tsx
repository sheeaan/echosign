import { useState } from 'react';

export const VoiceCaptureSection = (): JSX.Element => {
    const [isRecording, setIsRecording] = useState(false);

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-neutral-950">
            <div className="text-center space-y-6">
                <button
                    onClick={() => setIsRecording(!isRecording)}
                    className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${isRecording
                            ? 'bg-emergency-red animate-pulse shadow-lg shadow-red-500/50'
                            : 'bg-neutral-800 hover:bg-neutral-700'
                        }`}
                >
                    <svg
                        className="w-16 h-16 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path
                            fillRule="evenodd"
                            d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                            clipRule="evenodd"
                        />
                    </svg>
                </button>

                <p className="text-white text-lg">
                    {isRecording ? 'Recording...' : 'Tap to Record'}
                </p>

                <div className="text-sm text-gray-500">
                    Speak your emergency message
                </div>
            </div>
        </div>
    );
};
