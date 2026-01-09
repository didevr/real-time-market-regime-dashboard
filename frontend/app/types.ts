export interface BacktestResult {
    ticker: string;
    metrics: {
        total_return_tsmom: number;
        total_return_buyhold: number;
    };
    chart_data: Array<{
        date: string;
        price: number;
        tsmom_cum: number;
        buyhold_cum: number;
        signal: number;
    }>;
}

export interface RegimeResult {
    ticker: string;
    regime: number; // 0 = Bull, 1 = Bear
    label: string;
    last_updated: string;
    window_size: number;
}
