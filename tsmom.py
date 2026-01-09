import numpy as np
import pandas as pd

def calculate_lookback_return(prices: pd.Series, lookback: int) -> pd.Series:
    """
    Calculate the return over the past 'lookback' periods.
    Formula: r = (P_t - P_{t-k}) / P_{t-k}
    """
    return (prices - prices.shift(lookback)) / prices.shift(lookback)

def generate_signal(lookback_returns: pd.Series) -> pd.Series:
    """
    Generate TSMOM signal: +1 if positive, -1 if negative.
    Formula: signal = sign(r_{t-k:t})
    """
    return np.sign(lookback_returns)

def calculate_strategy_returns(signals: pd.Series, daily_returns: pd.Series) -> pd.Series:
    """
    Calculate strategy returns.
    Formula: r_tsmom = signal_{t-1} * r_t
    """
    return signals.shift(1) * daily_returns

def tsmom_backtest(prices: pd.Series, lookback: int = 252) -> pd.DataFrame:
    """
    Complete TSMOM backtest.
    
    Returns:
        pd.DataFrame with columns: ['price', 'daily_return', 'lookback_return', 'signal', 'tsmom_return', 'cumulative_tsmom', 'cumulative_buyhold']
    """
    df = pd.DataFrame(index=prices.index)
    df['price'] = prices
    
    # Step 1: Daily returns
    df['daily_return'] = prices.pct_change()
    
    # Step 2: Lookback return
    df['lookback_return'] = calculate_lookback_return(prices, lookback)
    
    # Step 3: Signal
    df['signal'] = generate_signal(df['lookback_return'])
    
    # Step 4: Strategy return
    df['tsmom_return'] = calculate_strategy_returns(df['signal'], df['daily_return'])
    
    # Step 5: Cumulative returns
    df['cumulative_tsmom'] = (1 + df['tsmom_return'].fillna(0)).cumprod()
    df['cumulative_buyhold'] = (1 + df['daily_return'].fillna(0)).cumprod()
    
    return df
