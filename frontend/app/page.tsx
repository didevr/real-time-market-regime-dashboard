'use client';

import { useState, useEffect } from 'react';
import { Activity, AlertCircle } from 'lucide-react';
import { fetchRegimeData, fetchBacktestData } from './actions';
import { RegimeResult, BacktestResult } from './types';
import RegimeCard from './components/RegimeCard';
import PerformanceMetrics from './components/PerformanceMetrics';
import TSMOMChart from './components/TSMOMChart';

export default function Dashboard() {
  const [ticker, setTicker] = useState('SPY');
  const [regimeData, setRegimeData] = useState<RegimeResult | null>(null);
  const [backtestData, setBacktestData] = useState<BacktestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      // Parallel fetch for better performance
      const [regime, backtest] = await Promise.all([
        fetchRegimeData(ticker),
        fetchBacktestData(ticker)
      ]);

      setRegimeData(regime);
      setBacktestData(backtest);

    } catch (err: any) {
      setError(err.message || 'An error occurred');
      // If one fails, we might still want to show the other? For now, fail all.
      setRegimeData(null);
      setBacktestData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [ticker]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 font-sans p-6 md:p-8">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent tracking-tight">
            Real-Time Market Regime <span className="text-white">Dashboard</span>
          </h1>
          <p className="text-gray-400 mt-2 text-sm uppercase tracking-wider font-semibold">
            Advanced Regime Detection & TSMOM Strategy
          </p>
        </div>
        <div className="flex items-center gap-3 bg-gray-900 p-2 rounded-xl border border-gray-800 shadow-xl">
          <div className="relative">
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              className="bg-gray-950 border border-gray-700 text-white pl-4 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 w-32 font-mono font-bold text-center tracking-widest transition-all"
              placeholder="TICKER"
            />
          </div>
          <button
            onClick={fetchData}
            className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-purple-900/20"
            disabled={loading}
          >
            {loading ? <Activity className="animate-spin" size={18} /> : null}
            {loading ? 'SYNCING...' : 'ANALYZE'}
          </button>
        </div>
      </header>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl mb-8 flex items-center gap-3 text-red-200 animate-in fade-in slide-in-from-top-4">
          <AlertCircle size={20} className="text-red-500" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">

        {/* Metric Cards */}
        <div className="col-span-1 md:col-span-2 lg:col-span-4 space-y-6">
          <RegimeCard data={regimeData} loading={loading} />
          <PerformanceMetrics data={backtestData} loading={loading} />
        </div>

        {/* Chart Area */}
        <TSMOMChart data={backtestData} loading={loading} />
      </div>
    </div>
  );
}
