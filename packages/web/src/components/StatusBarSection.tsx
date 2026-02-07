export const StatusBarSection = (): JSX.Element => {
    return (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-neutral-900 border-t border-neutral-800">
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emergency-green animate-pulse"></div>
                    <span className="text-gray-400">Ready</span>
                </div>
                <div className="text-gray-500">
                    {new Date().toLocaleTimeString()}
                </div>
            </div>
        </div>
    );
};
