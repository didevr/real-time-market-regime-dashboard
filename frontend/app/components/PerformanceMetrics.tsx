'use client';

import { BacktestResult } from '../types';

interface PerformanceMetricsProps {
    data: BacktestResult | null;
    loading: boolean;
}

export default function PerformanceMetrics({ data, loading }: PerformanceMetricsProps) {
    return (
        <div className="bg-gray-900/60 border border-gray-800 p-6 rounded-2xl backdrop-blur-xl shadow-2xl hover:border-gray-700 transition-colors">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                Performance Metrics
            </h2>
            {loading ? (
                <div className="space-y-4 animate-pulse">
                    <div className="h-16 bg-gray-800 rounded-lg"></div>
                    <div className="h-16 bg-gray-800 rounded-lg"></div>
                </div>
            ) : data ? (
                <div className="space-y-4">
                    <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700/50 flex justify-between items-center group hover:bg-gray-800/50 transition-colors">
                        <div className="flex flex-col">
                            <span className="text-gray-400 text-xs uppercase tracking-wider font-semibold">TSMOM Strategy</span>
                            <span className="text-gray-500 text-[10px]">Cumulative Return</span>
                        </div>
                        <span className={`font-mono font-bold text-2xl ${data.metrics.total_return_tsmom >= 0 ? 'text-purple-400' : 'text-rose-400'
                            }`}>
                            {(data.metrics.total_return_tsmom * 100).toFixed(2)}%
                        </span>
                    </div>
                    <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700/50 flex justify-between items-center group hover:bg-gray-800/50 transition-colors">
                        <div className="flex flex-col">
                            <span className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Buy & Hold</span>
                            <span className="text-gray-500 text-[10px]">Benchmark</span>
                        </div>
                        <span className={`font-mono font-bold text-2xl ${data.metrics.total_return_buyhold >= 0 ? 'text-blue-400' : 'text-blue-300'
                            }`}>
                            {(data.metrics.total_return_buyhold * 100).toFixed(2)}%
                        </span>
                    </div>
                </div>
            ) : (
                <div className="h-32 flex items-center justify-center text-gray-600">
                    No metrics available
                </div>
            )}
        </div>
    );
}
