'use client';

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { Activity } from 'lucide-react';
import { BacktestResult } from '../types';

interface TSMOMChartProps {
    data: BacktestResult | null;
    loading: boolean;
}

export default function TSMOMChart({ data, loading }: TSMOMChartProps) {
    return (
        <div className="col-span-1 md:col-span-2 lg:col-span-8 bg-gray-900/60 border border-gray-800 p-6 rounded-2xl backdrop-blur-xl shadow-2xl flex flex-col hover:border-gray-700 transition-colors">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                    Equity Curve Analysis
                </h2>
                {data && (
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                            <div className="w-3 h-3 rounded-full bg-purple-500"></div> TSMOM
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div> Benchmark
                        </div>
                    </div>
                )}
            </div>

            <div className="flex-1 w-full min-h-[450px] relative">
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm z-10 rounded-xl">
                        <Activity className="animate-spin text-purple-500" size={32} />
                    </div>
                ) : null}

                {data ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data.chart_data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorTsmom" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorBuyHold" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                            <XAxis
                                dataKey="date"
                                stroke="#4b5563"
                                tickFormatter={(val) => val.substring(0, 4)}
                                minTickGap={40}
                                tick={{ fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                                dy={10}
                            />
                            <YAxis
                                stroke="#4b5563"
                                domain={['auto', 'auto']}
                                tick={{ fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                                dx={-10}
                                tickFormatter={(val) => val.toFixed(2)}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#0f172a',
                                    borderColor: '#1f2937',
                                    borderRadius: '0.75rem',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                                    color: '#f3f4f6'
                                }}
                                itemStyle={{ color: '#e5e7eb' }}
                                cursor={{ stroke: '#4b5563', strokeDasharray: '4 4' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="tsmom_cum"
                                name="TSMOM Strategy"
                                stroke="#a855f7"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorTsmom)"
                            />
                            <Area
                                type="monotone"
                                dataKey="buyhold_cum"
                                name="Buy & Hold"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorBuyHold)"
                                strokeDasharray="4 4"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-600 border-2 border-dashed border-gray-800 rounded-xl">
                        <Activity size={32} className="mb-2 opacity-50" />
                        <p>Enter a ticker to analyze</p>
                    </div>
                )}
            </div>
        </div>
    );
}
