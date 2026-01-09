from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import yfinance as yf
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta

# Local imports
from wasserstein_kmeans import (
    WassersteinKMeans, 
    compute_log_returns, 
    create_sliding_windows,
    order_clusters_by_variance
)
from tsmom import tsmom_backtest

app = FastAPI(title="Market Regime & TSMOM API", version="1.0.0")

# Allow CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models for Response Validation ---

class RegimeData(BaseModel):
    ticker: str
    regime: int
    label: str
    last_updated: str
    window_size: int

class BacktestMetrics(BaseModel):
    total_return_tsmom: float
    total_return_buyhold: float

class ChartDataPoint(BaseModel):
    date: str
    price: float
    tsmom_cum: float
    buyhold_cum: float
    signal: int

class BacktestResponse(BaseModel):
    ticker: str
    metrics: BacktestMetrics
    chart_data: List[ChartDataPoint]

# -----------------------------------------------

def fetch_data(ticker: str, period: str = "5y") -> pd.Series:
    """Fetch close prices from yfinance with error handling."""
    try:
        # Standardize ticker
        ticker = ticker.upper().strip()
        df = yf.Ticker(ticker).history(period=period)
        
        if df.empty:
            raise ValueError(f"No data found for ticker '{ticker}'. Please check the symbol.")
            
        return df['Close']
    except Exception as e:
        # Re-raise as ValueError for cleaner handling in endpoints
        raise ValueError(str(e))

@app.get("/analyze", response_model=RegimeData)
def analyze_regime(
    ticker: str = Query(..., description="Stock Ticker (e.g. SPY)"),
    window_size: int = Query(63, description="Window size in days (approx 3 months)"),
    step_size: int = Query(5, description="Step size for sliding window"),
    n_clusters: int = Query(2, description="Number of regimes (clusters)")
):
    """
    Analyze current market regime using Wasserstein K-Means.
    """
    try:
        # 1. Fetch Data
        prices = fetch_data(ticker)
        
        # 2. Preprocess
        log_returns = compute_log_returns(prices.values)
        if len(log_returns) < window_size:
             raise HTTPException(status_code=400, detail="Data history too short for requested window size")

        windows = create_sliding_windows(log_returns, window_size, step_size)
        
        if len(windows) < n_clusters * 2:
             raise HTTPException(status_code=400, detail="Insufficient data segments for clustering")

        # 3. Train Model
        model = WassersteinKMeans(n_clusters=n_clusters, p=1, max_iter=50, random_state=42)
        model.fit(windows)
        
        # 4. Predict Current Regime
        current_window = log_returns[-window_size:]
        
        # Reorder clusters: 0 = Low Vol (Bull), 1 = High Vol (Bear)
        labels = model.labels_
        centroids = model.centroids_
        new_labels, new_centroids = order_clusters_by_variance(windows, labels, centroids)
        
        model.centroids_ = new_centroids
        current_regime_ordered = model.predict([current_window])[0]
        
        last_date = prices.index[-1].strftime('%Y-%m-%d')
        
        return RegimeData(
            ticker=ticker.upper(),
            regime=int(current_regime_ordered),
            label="Bull/Low Vol" if current_regime_ordered == 0 else "Bear/High Vol",
            last_updated=last_date,
            window_size=window_size
        )
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Analysis Error: {str(e)}")

@app.get("/backtest/tsmom", response_model=BacktestResponse)
def backtest_tsmom(
    ticker: str = Query(..., description="Stock Ticker (e.g. BTC-USD)"),
    lookback: int = Query(252, description="Lookback period in days")
):
    """
    Run TSMOM backtest on the ticker and return metrics + chart data.
    """
    try:
        prices = fetch_data(ticker, period="max")
        
        if len(prices) < lookback:
            raise HTTPException(status_code=400, detail=f"Not enough history for lookback {lookback}")
        
        # Run Strategy
        results = tsmom_backtest(prices, lookback=lookback)
        results = results.dropna()
        
        if results.empty:
             raise HTTPException(status_code=400, detail="Backtest resulted in empty data (check lookback period)")

        # Format Chart Data
        chart_data = []
        for date, row in results.iterrows():
            chart_data.append(ChartDataPoint(
                date=date.strftime('%Y-%m-%d'),
                price=float(row['price']),
                tsmom_cum=float(row['cumulative_tsmom']),
                buyhold_cum=float(row['cumulative_buyhold']),
                signal=int(row['signal'])
            ))
            
        final_tsmom = results['cumulative_tsmom'].iloc[-1] - 1
        final_buyhold = results['cumulative_buyhold'].iloc[-1] - 1
        
        return BacktestResponse(
            ticker=ticker.upper(),
            metrics=BacktestMetrics(
                total_return_tsmom=float(final_tsmom),
                total_return_buyhold=float(final_buyhold)
            ),
            chart_data=chart_data
        )

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Backtest Error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    # When running directly, use port 8001
    uvicorn.run(app, host="0.0.0.0", port=8001)
