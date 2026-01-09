'use client';

import { Activity, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { RegimeResult } from '../types';

interface RegimeCardProps {
    data: RegimeResult | null;
    loading: boolean;
}

export default function RegimeCard({ data, loading }: RegimeCardProps) {
    return (
        <div className="bg-gray-900/60 border border-gray-800 p-6 rounded-2xl backdrop-blur-xl shadow-2xl relative overflow-hidden group hover:border-gray-700 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Activity size={100} />
            </div>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500 neon-pulse"></div>
                Current Regime
            </h2>

            {loading ? (
                <div className="animate-pulse space-y-4">
                    <div className="h-24 w-24 bg-gray-800 rounded-full mx-auto"></div>
                    <div className="h-8 w-32 bg-gray-800 rounded mx-auto"></div>
                    <div className="h-4 w-48 bg-gray-800 rounded mx-auto"></div>
                </div>
            ) : data ? (
                <div className="text-center py-6 relative z-10">
                    <div className={`inline-flex items-center justify-center w-28 h-28 rounded-full mb-6 border-8 shadow-[0_0_30px_rgba(0,0,0,0.3)] transition-all duration-500 ${data.regime === 0
                        ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400 shadow-emerald-900/20'
                        : 'border-rose-500/20 bg-rose-500/5 text-rose-400 shadow-rose-900/20'
                        }`}>
                        {data.regime === 0 ? <TrendingUp size={48} strokeWidth={1.5} /> : <TrendingDown size={48} strokeWidth={1.5} />}
                    </div>
                    <h3 className={`text-5xl font-black mb-3 tracking-tight ${data.regime === 0 ? 'text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]' : 'text-rose-400 drop-shadow-[0_0_15px_rgba(251,113,133,0.3)]'
                        }`}>
                        {data.label.toUpperCase()}
                    </h3>
                    <div className="text-gray-400 text-xs font-mono uppercase tracking-widest flex items-center justify-center gap-2 mt-4 bg-gray-950/50 py-2 rounded-full w-fit mx-auto px-4 border border-gray-800">
                        <Clock size={12} /> Last: {data.last_updated}
                    </div>
                </div>
            ) : (
                <div className="h-64 flex flex-col items-center justify-center text-gray-600 gap-4">
                    <Activity size={48} className="opacity-20" />
                    <span>Waiting for data...</span>
                </div>
            )}
        </div>
    );
}
