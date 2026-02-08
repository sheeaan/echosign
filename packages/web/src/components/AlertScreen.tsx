import React, { useState } from 'react';
import { Incident } from '../types';
import { updateIncidentStatus, decodeHex, createIncident, classifyIncident } from '../services/incidents';
import { useAcousticListen } from '../hooks/useAcousticListen';

interface AlertScreenProps {
    isDarkMode: boolean;
    onToggleTheme: () => void;
    incidents: Incident[];
    onIncidentUpdate: (updated: Incident) => void;
    setCurrentScreen: (screen: string) => void;
}

function toHexString(bytes: Uint8Array): string {
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

const AlertScreen: React.FC<AlertScreenProps> = ({ isDarkMode, onToggleTheme, incidents, onIncidentUpdate, setCurrentScreen }) => {
    const [isAcknowledging, setIsAcknowledging] = useState(false);
    const [isDecoding, setIsDecoding] = useState(false);
    const [isDecodingHex, setIsDecodingHex] = useState(false);
    const [decodeStatus, setDecodeStatus] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { startListening, stopAndDecode, isListening } = useAcousticListen();
    const [hexInput, setHexInput] = useState('');

    // Show the most recent incident
    const latestIncident = incidents.length > 0 ? incidents[0] : null;

    const handleAcknowledge = async () => {
        if (!latestIncident) return;
        try {
            setIsAcknowledging(true);
            setError(null);
            const updated = await updateIncidentStatus(latestIncident.id, 'verified');
            onIncidentUpdate(updated);
        } catch (err) {
            console.error('Failed to acknowledge:', err);
            setError(err instanceof Error ? err.message : 'Failed to acknowledge');
        } finally {
            setIsAcknowledging(false);
        }
    };

    const handleDecodeHex = async () => {
        const cleanedHex = hexInput.replace(/\s/g, '').toLowerCase();
        if (cleanedHex.length !== 48 || !/^[0-9a-f]+$/.test(cleanedHex)) {
            setError('Invalid hex string. Must be 48 hexadecimal characters.');
            return;
        }

        setIsDecodingHex(true);
        setDecodeStatus('Decoding hex to text...');
        setError(null);

        try {
            const result = await decodeHex(cleanedHex, null, false); // Assume exact match for manual input
            setDecodeStatus('Creating incident from decoded data...');

            // Classify the decoded text
            const classification = await classifyIncident(result.text);

            const incident: Incident = {
                id: cleanedHex, // Use hex as ID
                type: classification.type,
                code: classification.code,
                priority: classification.priority,
                match: classification.confidence,
                timestamp: new Date().toLocaleTimeString() + ' UTC',
                signer: 'MANUAL', // Indicate manual input
                status: 'pending',
                description: result.text,
                hexCode: cleanedHex,
            };

            const created = await createIncident(incident);
            onIncidentUpdate(created);
            setDecodeStatus(`Decoded: "${result.text.slice(0, 60)}..."`);
        } catch (err) {
            console.error('Hex decode failed:', err);
            setError(err instanceof Error ? err.message : 'Hex decode failed');
            setDecodeStatus(null);
        } finally {
            setIsDecodingHex(false);
        }
    };

    const handleDecodeAudio = async () => {
        if (isListening) {
            // Stop listening and decode
            setIsDecoding(true);
            setDecodeStatus('Decoding FSK signal...');
            setError(null);
            try {
                const decoded = stopAndDecode();
                if (!decoded || decoded.data.length === 0) {
                    setError('No signal detected. Try again.');
                    setIsDecoding(false);
                    setDecodeStatus(null);
                    return;
                }

                const hexStr = toHexString(decoded.data);
                setDecodeStatus('Decoding hex to text...');

                // Decode the hex through the server
                const result = await decodeHex(hexStr, null, decoded.errorPositions.length > 0);
                setDecodeStatus('Creating incident from decoded data...');

                // Classify the decoded text
                const classification = await classifyIncident(result.text);

                // Create an incident from the decoded data
                const incident: Incident = {
                    id: hexStr,
                    type: classification.type,
                    code: classification.code,
                    priority: classification.priority,
                    match: classification.confidence,
                    timestamp: new Date().toLocaleTimeString() + ' UTC',
                    signer: 'ACOUSTIC',
                    status: 'pending',
                    description: result.text,
                    hexCode: hexStr,
                };

                const created = await createIncident(incident);
                onIncidentUpdate(created);
                setDecodeStatus(`Decoded: "${result.text.slice(0, 60)}..."`);
            } catch (err) {
                console.error('Decode failed:', err);
                setError(err instanceof Error ? err.message : 'Decode failed');
                setDecodeStatus(null);
            } finally {
                setIsDecoding(false);
            }
        } else {
            // Start listening
            try {
                setError(null);
                setDecodeStatus('Listening for FSK signal...');
                await startListening();
            } catch (err) {
                console.error('Failed to start listening:', err);
                setError(err instanceof Error ? err.message : 'Microphone access denied');
                setDecodeStatus(null);
            }
        }
    };

    return (
        <div className="flex flex-col min-h-full">
            <header className="flex items-center p-4 pt-3 pb-3 justify-between bg-white/95 dark:bg-brand-bg-dark/95 backdrop-blur-md border-b border-gray-200 dark:border-brand-border sticky top-0 z-50 transition-colors">
                <button onClick={() => setCurrentScreen('report')} className="text-primary flex size-10 items-center justify-center hover:bg-brand-dark/10 rounded-functional transition-colors">
                    <span className="material-symbols-outlined text-[24px]">chevron_left</span>
                </button>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-mono text-primary uppercase tracking-[0.3em] font-bold">Inbound Comms</span>
                    <h2 className="font-black tracking-tighter dark:text-white tactical-font text-lg font-bold leading-none tracking-wider uppercase">Alert Channel Alpha</h2>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onToggleTheme}
                        className="w-10 h-10 flex items-center justify-center rounded-xl transition-all
                                bg-white dark:bg-slate-800 
                                border border-slate-200 dark:border-slate-700
                                shadow-sm dark:shadow-[inset_0_1px_2px_rgba(255,255,255,0.1)]
                                hover:bg-slate-100 dark:hover:bg-slate-700/80
                                z-10"
                    >
                        <span 
                            className={`material-symbols-outlined text-xl transition-all duration-300 ${
                                isDarkMode 
                                    ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]' 
                                    : 'text-slate-600'
                            }`}
                        >
                            {isDarkMode ? 'light_mode' : 'dark_mode'}
                        </span>
                    </button>
                </div>
            </header>

            <main className="flex-1 px-4 py-6 space-y-6">
                {/* Alert Card */}
                <section className="rounded-functional bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden transition-colors">
                    {/* Image/Map Container */}
                    <div className="w-full aspect-[21/2.2] bg-center bg-cover relative">
                        
                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex gap-1.5">
                            {latestIncident ? (
                                <>
                                    <div className={`text-brand-dark tactical-font text-[10px] font-bold px-2.5 py-1 rounded-tactical flex items-center gap-2 shadow-xl border border-white/20 ${latestIncident.priority === 'HIGH' || latestIncident.priority === 'CRITICAL' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
                                        <span className="material-symbols-outlined text-[14px] font-bold">
                                            {latestIncident.priority === 'HIGH' || latestIncident.priority === 'CRITICAL' ? 'warning' : 'info'}
                                        </span>
                                        <span className="tracking-widest uppercase">{latestIncident.priority}</span>
                                    </div>
                                    <div className={`text-white tactical-font text-[9px] font-bold px-2.5 py-1 rounded-tactical flex items-center gap-2 border border-white/10 backdrop-blur-md shadow-sm ${latestIncident.status === 'verified' ? 'bg-blue-600' : 'bg-slate-600/80'}`}>
                                        <span className="material-symbols-outlined text-[12px] font-bold">
                                            {latestIncident.status === 'verified' ? 'verified_user' : 'schedule'}
                                        </span>
                                        <span className="tracking-widest uppercase">{latestIncident.status}</span>
                                    </div>
                                </>
                            ) : (
                                <div className="bg-slate-500 text-white tactical-font text-[10px] font-bold px-3 py-1.5 rounded-tactical flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[16px]">inbox</span>
                                    <span className="tracking-widest">IDLE</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Content Area - Tightened padding and spacing */}
                    <div className="px-5 pb-5 pt-1 space-y-3">
                        <header>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="h-[1px] flex-1 bg-blue-500/20"></div>
                                <span className="font-mono text-blue-600 dark:text-blue-400 text-[9px] font-bold uppercase tracking-[0.3em]">
                                    {latestIncident ? `CODE: ${latestIncident.code}` : 'STANDBY'}
                                </span>
                                <div className="h-[1px] flex-1 bg-blue-500/20"></div>
                            </div>
                            <h1 className="text-slate-900 dark:text-white tactical-font text-xl font-black leading-tight uppercase text-center tracking-tight italic">
                                {latestIncident ? latestIncident.type : 'Signal Lost'}
                            </h1>
                        </header>

                        {latestIncident && (
                            <>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-200 dark:border-white/5 transition-colors">
                                        <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 mb-0.5">
                                            <span className="material-symbols-outlined text-[16px]">schedule</span>
                                            <span className="text-[8px] font-bold uppercase tracking-wider">Time</span>
                                        </div>
                                        <p className="font-mono text-sm pt-1 font-bold text-slate-700 dark:text-slate-200">{latestIncident.timestamp}</p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-200 dark:border-white/5 transition-colors">
                                        <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 mb-0.5">
                                            <span className="material-symbols-outlined text-[16px]">analytics</span>
                                            <span className="text-[8px] font-bold uppercase tracking-wider">Confidence</span>
                                        </div>
                                        <p className="font-mono text-lg font-black text-blue-600 dark:text-blue-400">
                                            {latestIncident.match}<span className="text-[10px] opacity-50">%</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-slate-50/50 dark:bg-white/5 p-3 rounded-xl border border-slate-200 dark:border-white/10">
                                    <p className="text-slate-700 dark:text-slate-300 tactical-font text-xs font-semibold leading-relaxed uppercase">
                                        {latestIncident.description}
                                    </p>
                                    <div className="mt-2 pt-2 border-t border-slate-200 dark:border-white/5 flex justify-between items-center">
                                        <p className="text-slate-400 dark:text-slate-500 font-mono text-[9px]">AUTH: {latestIncident.signer}</p>
                                        <span className="text-[9px] font-bold text-blue-500 animate-pulse">● LIVE</span>
                                    </div>
                                </div>
                            </>
                        )}

                        {!latestIncident && (
                            <div className="text-center py-6">
                                <span className="material-symbols-outlined text-3xl text-slate-300 dark:text-slate-700 mb-1">radar</span>
                                <p className="text-slate-400 dark:text-slate-600 text-[11px] font-bold uppercase tracking-widest">Scanning Frequencies...</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Manual Hex Input Section */}
                <section className="space-y-3">
                    <h3 className="text-primary tactical-font text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] font-bold">keyboard</span> Manual Hex Input
                    </h3>
                    <div className="rounded-functional bg-white dark:bg-brand-card-dark border border-gray-200 dark:border-brand-border overflow-hidden transition-colors">
                        <div className="p-5">
                            <textarea
                                value={hexInput}
                                onChange={(e) => setHexInput(e.target.value)}
                                placeholder="Enter 48-character hex code (e.g., 010203...)"
                                className="w-full h-24 bg:brand-card-light dark:bg-brand-card-dark border border-gray-300 dark:border-brand-border rounded-input p-3 dark:text-white text-sm font-mono resize-none focus:outline-none focus:border-primary mb-4"
                            />
                            <button
                                onClick={handleDecodeHex}
                                disabled={isDecodingHex || !hexInput.trim()}
                                className="w-full py-3 px-6 bg-primary hover:bg-primary/90 text-brand-dark font-extrabold rounded-tactical uppercase tracking-wider text-sm transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 shadow-lg"
                            >
                                {isDecodingHex ? 'DECODING HEX...' : 'DECODE HEX'}
                            </button>
                        </div>
                    </div>
                </section>

                {/* Audio Decode Section */}
                <section className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-primary tactical-font text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px] font-bold">analytics</span> Audio Analysis
                        </h3>
                        {isListening && (
                            <span className="font-mono text-[9px] text-brand-success font-bold animate-pulse">LIVE SIGNAL</span>
                        )}
                    </div>

                    <div className="rounded-functional bg-white dark:bg-brand-card-dark border border-gray-200 dark:border-brand-border overflow-hidden transition-colors">
                        <div className="h-36 w-full relative bg-gray-50 dark:bg-black/20">
                            <div className="absolute inset-0 spectrogram-grid opacity-30"></div>
                            <div className="absolute left-2 top-0 h-full py-2 flex flex-col justify-between font-mono text-[8px] text-gray-400 z-10">
                                <span>24kHz</span>
                                <span>12kHz</span>
                                <span>0kHz</span>
                            </div>
                            <div className="absolute inset-0 flex items-end justify-around px-8 pb-3">
                                {[...Array(15)].map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-1.5 rounded-full transition-all duration-300 ease-in-out ${isListening ? 'bg-brand-success' : 'bg-gray-300 dark:bg-gray-700'}`}
                                        style={{
                                            height: isListening ? `${Math.random() * 80 + 20}%` : '10%',
                                            opacity: isListening ? Math.random() * 0.5 + 0.5 : 0.3,
                                            animation: isListening ? `pulse ${Math.random() * 2 + 1}s infinite` : 'none',
                                        }}
                                    ></div>
                                ))}
                            </div>
                            {isListening && (
                                <div className="absolute top-0 right-1/4 h-full w-[1px] bg-primary/40 shadow-[0_0_8px_#FCBA04]"></div>
                            )}
                            <div className="absolute bottom-2 right-3 z-10">
                                <span className="font-mono text-[8px] text-gray-500 uppercase tracking-widest bg-gray-100 dark:bg-black/40 px-2 py-0.5 rounded border border-gray-200 dark:border-white/5">
                                    {isListening ? 'RX: Active' : 'RX: Idle'}
                                </span>
                            </div>
                        </div>
                        <div className="p-5 border-t border-gray-100 dark:border-white/5">
                            {decodeStatus && (
                                <div className="mb-4 bg-gray-50 dark:bg-black/20 rounded-tactical p-3 border border-gray-200 dark:border-white/5">
                                    <p className="text-xs font-mono text-brand-dark dark:text-white/80">{decodeStatus}</p>
                                </div>
                            )}
                            {error && (
                                <div className="mb-4 bg-red-50 dark:bg-red-900/20 rounded-tactical p-3 border border-red-200 dark:border-red-800">
                                    <p className="text-xs font-mono text-red-600 dark:text-red-400">{error}</p>
                                </div>
                            )}
                            <button
                                onClick={handleDecodeAudio}
                                disabled={isDecoding}
                                className={`w-full flex items-center justify-center py-2 px-6 gap-2 rounded-tactical font-extrabold text-sm uppercase tracking-wider transition-all duration-150 active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
                                    ${
                                        isListening
                                            ? 'bg-red-600 hover:bg-red-700 text-white'
                                            : 'bg-primary hover:bg-primary/90 text-brand-dark'
                                    }
                                `}
                            >
                                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                                    {isListening ? 'stop_circle' : isDecoding ? 'progress_activity' : 'play_circle'}
                                </span>
                                {isListening ? 'STOP & DECODE' : isDecoding ? 'DECODING...' : 'DECODE AUDIO'}
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="bg-white/95 dark:bg-brand-bg-dark px-4 pt-4 pb-10 border-t border-gray-200 dark:border-brand-border flex gap-3 shadow-xl transition-colors">
                <button className="flex-1 flex items-center justify-center py-3 px-4 rounded-tactical font-extrabold text-[11px] uppercase tracking-[0.2em] transition-all duration-150 active:scale-[0.98] border bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200 dark:bg-slate-800/40 dark:text-slate-400 dark:border-white/10 dark:hover:bg-slate-800/60">
                    IGNORE
                </button>
                <button
                    onClick={handleAcknowledge}
                    disabled={!latestIncident || latestIncident.status !== 'pending' || isAcknowledging}
                    className="flex-[1.5] flex items-center justify-center py-3 px-4 gap-2 rounded-tactical font-extrabold text-sm uppercase tracking-wider shadow-lg transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-white"
                >
                    <span className="material-symbols-outlined text-[20px] text-primary">task_alt</span>
                    {isAcknowledging ? 'ACKNOWLEDGING...' : latestIncident?.status === 'verified' ? 'ACKNOWLEDGED' : 'ACKNOWLEDGE'}
                </button>
            </footer>
        </div>
    );
};

export default AlertScreen;
