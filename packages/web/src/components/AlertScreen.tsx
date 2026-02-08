import React from 'react';

interface AlertScreenProps {
    isDarkMode: boolean;
    onToggleTheme: () => void;
}

const AlertScreen: React.FC<AlertScreenProps> = ({ isDarkMode, onToggleTheme }) => {
    return (
        <div className="flex flex-col min-h-full">
            <header className="flex items-center p-4 pt-12 pb-4 justify-between bg-white/95 dark:bg-brand-bg-dark/95 backdrop-blur-md border-b border-gray-200 dark:border-brand-border sticky top-0 z-50 transition-colors">
                <button className="text-primary flex size-10 items-center justify-center hover:bg-brand-dark/10 rounded-functional transition-colors">
                    <span className="material-symbols-outlined text-[24px]">chevron_left</span>
                </button>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-mono text-primary uppercase tracking-[0.3em] font-bold">Inbound Comms</span>
                    <h2 className="text-brand-dark dark:text-white tactical-font text-lg font-bold leading-none tracking-wider uppercase">Alert Channel Alpha</h2>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={onToggleTheme}
                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                    >
                        <span className="material-symbols-outlined text-xl text-brand-dark dark:text-white">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
                    </button>
                    <div className="flex w-6 items-center justify-end mr-1">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                        </span>
                    </div>
                </div>
            </header>

            <main className="flex-1 px-4 py-6 space-y-6">
                <section className="rounded-functional bg-white dark:bg-brand-card-dark border border-gray-200 dark:border-brand-border shadow-sm overflow-hidden transition-colors">
                    <div className="w-full aspect-[16/8] bg-center bg-cover relative grayscale-[0.2]" style={{ backgroundImage: 'url("https://picsum.photos/seed/tacticalmap/800/400")' }}>
                        <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-brand-card-dark via-transparent to-transparent"></div>
                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                            <div className="bg-primary text-brand-dark tactical-font text-[11px] font-bold px-3 py-1.5 rounded-tactical flex items-center gap-2 shadow-xl border border-white/20">
                                <span className="material-symbols-outlined text-[16px] font-bold">warning</span>
                                <span className="tracking-widest uppercase">Critical Incident</span>
                            </div>
                            <div className="bg-brand-success text-white tactical-font text-[10px] font-bold px-3 py-1 rounded-tactical flex items-center gap-2 border border-white/10 backdrop-blur-sm shadow-sm">
                                <span className="material-symbols-outlined text-[14px] font-bold">verified_user</span>
                                <span className="tracking-widest uppercase text-xs">Verified Feed</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 space-y-5">
                        <header>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="h-px flex-1 bg-primary/20"></div>
                                <span className="font-mono text-primary/60 text-[10px] font-bold uppercase tracking-[0.2em]">Asset ID: S7-NB</span>
                                <div className="h-px flex-1 bg-primary/20"></div>
                            </div>
                            <h1 className="text-brand-dark dark:text-white tactical-font text-2xl font-bold leading-tight uppercase text-center tracking-tight">Sector 7 - North Bridge</h1>
                        </header>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-100 dark:bg-brand-dark/30 p-3 rounded-functional border border-gray-200 dark:border-brand-border/50 transition-colors text-brand-dark dark:text-white">
                                <div className="flex items-center gap-2 text-primary/70 mb-1">
                                    <span className="material-symbols-outlined text-[18px]">groups</span>
                                    <span className="text-[9px] tactical-font font-bold uppercase tracking-wider">Est. Casualties</span>
                                </div>
                                <p className="tactical-font text-xl font-bold">150+ <span className="text-[10px] text-gray-400">PERS</span></p>
                            </div>
                            <div className="bg-gray-100 dark:bg-brand-dark/30 p-3 rounded-functional border border-gray-200 dark:border-brand-border/50 transition-colors text-brand-dark dark:text-white">
                                <div className="flex items-center gap-2 text-primary/70 mb-1">
                                    <span className="material-symbols-outlined text-[18px]">radar</span>
                                    <span className="text-[9px] tactical-font font-bold uppercase tracking-wider">Radius</span>
                                </div>
                                <p className="tactical-font text-xl font-bold">2.0<span className="text-[10px] text-gray-400"> KM</span></p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                                <p className="text-brand-dark dark:text-white tactical-font text-sm font-semibold tracking-wide uppercase">Flash Flood Ingress</p>
                                <p className="text-gray-400 dark:text-gray-500 font-mono text-[10px]">Command Center • T-minus 2m</p>
                            </div>
                            <button className="bg-primary text-brand-dark tactical-font font-bold text-xs py-3 px-5 rounded-tactical hover:brightness-110 transition-all flex items-center gap-2 shadow-lg active:scale-95">
                                <span className="material-symbols-outlined text-[18px]">near_me</span>
                                NAV
                            </button>
                        </div>
                    </div>
                </section>

                <section className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-primary tactical-font text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px] font-bold">analytics</span> Audio Analysis
                        </h3>
                        <span className="font-mono text-[9px] text-brand-success font-bold animate-pulse">LIVE SIGNAL</span>
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
                                        className="w-1.5 bg-brand-success rounded-full transition-all duration-300 ease-in-out"
                                        style={{
                                            height: `${Math.random() * 80 + 20}%`,
                                            opacity: Math.random() * 0.5 + 0.5,
                                            animation: `pulse ${Math.random() * 2 + 1}s infinite`
                                        }}
                                    ></div>
                                ))}
                            </div>
                            <div className="absolute top-0 right-1/4 h-full w-[1px] bg-primary/40 shadow-[0_0_8px_#FCBA04]"></div>
                            <div className="absolute bottom-2 right-3 z-10">
                                <span className="font-mono text-[8px] text-gray-500 uppercase tracking-widest bg-gray-100 dark:bg-black/40 px-2 py-0.5 rounded border border-gray-200 dark:border-white/5">Gain: +12dB</span>
                            </div>
                        </div>
                        <div className="p-5 border-t border-gray-100 dark:border-white/5">
                            <div className="flex items-center gap-4 mb-5">
                                <div className="bg-gray-100 dark:bg-brand-dark p-3 rounded-functional border border-primary/20 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>graphic_eq</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-brand-dark dark:text-white tactical-font text-base font-bold uppercase tracking-tight">Dispatch #419-TX</p>
                                    <p className="font-mono text-[10px] text-primary/60 uppercase font-bold tracking-tighter">AES-256 Encrypted Signal</p>
                                </div>
                                <div className="text-primary font-mono text-xs font-bold bg-gray-100 dark:bg-brand-dark/50 px-2.5 py-1.5 rounded-tactical border border-gray-200 dark:border-brand-border">02:23</div>
                            </div>
                            <button className="w-full flex items-center justify-center rounded-functional h-14 bg-primary text-brand-dark gap-3 tactical-font font-bold text-lg tracking-widest shadow-lg hover:brightness-110 active:scale-[0.98] transition-all">
                                <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
                                DECODE AUDIO
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="bg-white/95 dark:bg-brand-bg-dark px-4 pt-4 pb-10 border-t border-gray-200 dark:border-brand-border flex gap-3 shadow-xl transition-colors">
                <button className="flex-1 flex items-center justify-center h-14 rounded-functional bg-gray-100 dark:bg-brand-dark/20 text-gray-500 dark:text-gray-400 tactical-font font-bold text-sm tracking-[0.2em] border border-gray-200 dark:border-brand-border active:brightness-90 transition-colors">
                    IGNORE
                </button>
                <button className="flex-[1.5] flex items-center justify-center h-14 rounded-functional bg-brand-dark text-white tactical-font font-bold text-sm tracking-[0.2em] gap-2 shadow-xl border border-primary/30 active:scale-95 transition-all">
                    <span className="material-symbols-outlined text-[20px] text-primary">task_alt</span>
                    ACKNOWLEDGE
                </button>
            </footer>
        </div>
    );
};

export default AlertScreen;
