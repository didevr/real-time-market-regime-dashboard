'use server';

import { BacktestResult, RegimeResult } from './types';

const API_BASE_URL = 'http://localhost:8001';

export async function fetchRegimeData(ticker: string, n_clusters: number = 2): Promise<RegimeResult> {
    try {
        const response = await fetch(`${API_BASE_URL}/analyze?ticker=${ticker}&n_clusters=${n_clusters}`, {
            cache: 'no-store'
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch regime data: ${errorText}`);
        }
        return response.json();
    } catch (error: any) {
        console.error('Fetch Regime Error:', error);
        throw new Error(error.message || 'Failed to fetch regime data');
    }
}

export async function fetchBacktestData(ticker: string): Promise<BacktestResult> {
    try {
        const response = await fetch(`${API_BASE_URL}/backtest/tsmom?ticker=${ticker}`, {
            cache: 'no-store'
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch backtest data: ${errorText}`);
        }
        return response.json();
    } catch (error: any) {
        console.error('Fetch Backtest Error:', error);
        throw new Error(error.message || 'Failed to fetch backtest data');
    }
}
