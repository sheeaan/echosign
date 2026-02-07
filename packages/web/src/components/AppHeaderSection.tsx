export const AppHeaderSection = (): JSX.Element => {
    return (
        <div className="flex items-center justify-between p-4 bg-neutral-900 text-white border-b-2 border-red-600">
            <div className="flex items-center gap-3">
                {/* Logo/Icon */}
                <div className="w-10 h-10 bg-red-600 flex items-center justify-center font-bold text-xl">
                    E
                </div>

                {/* Title */}
                <div>
                    <h1 className="text-lg font-bold tracking-tight">ECHOSIGN</h1>
                    <div className="text-[10px] text-gray-400 tracking-tight">OFFLINE MESH v2.4</div>
                </div>
            </div>

            {/* Status */}
            <div className="flex flex-col items-end gap-px">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span className="text-[10px] text-green-600">ONLINE</span>
                </div>
                <div className="text-[10px] text-gray-400">
                    {new Date().toLocaleTimeString('en-US', { hour12: false, timeZone: 'UTC' })} UTC
                </div>
            </div>
        </div>
    );
};

