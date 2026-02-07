import { useState } from 'react';
import { AppHeaderSection } from './AppHeaderSection.js';
import { ModeSelectionSection } from './ModeSelectionSection.js';
import { EncodePanel } from './EncodePanel.js';
import { DecodePanel } from './DecodePanel.js';
import { AuditPanel } from './AuditPanel.js';
import { StatusBarSection } from './StatusBarSection.js';

export const Frame = (): JSX.Element => {
    const [mode, setMode] = useState<'encode' | 'decode' | 'audit'>('encode');

    return (
        <div className="inline-flex flex-col items-start relative bg-white border-2 border-solid border-[#ced4da]">
            <div className="relative w-[375px] h-[1080px] bg-neutral-950 border-0 border-none overflow-hidden">
                <div className="relative h-full flex flex-col border-0 border-none">
                    <AppHeaderSection />
                    <ModeSelectionSection mode={mode} setMode={setMode} />

                    {/* Main content area with scrolling */}
                    <div className="flex-1 overflow-y-auto p-4 pb-20 text-white">
                        {mode === 'encode' && <EncodePanel />}
                        {mode === 'decode' && <DecodePanel />}
                        {mode === 'audit' && <AuditPanel />}
                    </div>

                    <StatusBarSection />
                </div>
            </div>
        </div>
    );
};
