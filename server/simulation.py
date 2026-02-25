import yfinance as yf
import numpy as np
import numpy.random as npr
import math
import pandas as pd
import json

def calc_daily_log_return(ticker_symb):
    ticker = yf.Ticker(ticker_symb)
    close_history = ticker.history(period="max")["Close"].to_numpy()
    daily_log_return = np.log(close_history[1:]/close_history[:-1])

    return daily_log_return

def calc_drift(ticker_symb, t):
    daily_log_ret = calc_daily_log_return(ticker_symb)    
    drift = t * (daily_log_ret.mean() - daily_log_ret.var() / 2)

    return drift

def calc_time_adj_vol(ticker_symb, t):
    daily_log_ret = calc_daily_log_return(ticker_symb)
    time_adj_vol = np.sqrt(t) * np.std(daily_log_ret)

    return time_adj_vol

def simulate(ticker_symb, num_sim, t):
    ticker = yf.Ticker(ticker_symb)
    close_history = ticker.history(period="max")["Close"].to_numpy()
    
    drift = calc_drift(ticker_symb, t)
    time_adj_vol = calc_time_adj_vol(ticker_symb, t)

    result = np.zeros(num_sim)

    for i in range(num_sim):
        result[i] = close_history[-1] * math.exp(drift + time_adj_vol * npr.randn())

    return result

def simulate_multiple(stocks, weights, num_sim, t):
    weights = np.array(weights)
    
    num_stocks = len(stocks)
    tickers = [yf.Ticker(ticker) for ticker in stocks]
    
    close_dfs = [yf.Ticker(t).history(period="max")[["Close"]].rename(columns={"Close": t}) for t in stocks]
    all_close = pd.concat(close_dfs, axis=1)
    aligned_close = all_close.dropna()
    
    close_history_mat = aligned_close.to_numpy()
    prices_today = close_history_mat[-1, :]
    
    daily_ret = np.log(close_history_mat[1:] / close_history_mat[:-1])
    
    cov_matrix = np.cov(daily_ret.T)

    drifts = np.array([calc_drift(ticker, t) for ticker in stocks])
    time_adj_vols = np.array([calc_time_adj_vol(ticker, t) for ticker in stocks])
    
    result = np.zeros(num_sim)
    
    for i in range(num_sim):
        Z = np.random.multivariate_normal(mean=np.zeros(num_stocks), cov=cov_matrix)
        projected_vals_adj = weights * prices_today * np.exp(drifts + time_adj_vols * Z)
        proj_portfolio_val = projected_vals_adj.sum()
        result[i] = proj_portfolio_val

    return result    

def to_json(result):
    mean = float(np.mean(result))
    median = float(np.median(result))
    std_dev = float(np.std(result))
    min_val = float(np.min(result))
    max_val = float(np.max(result))

    metrics = {
    "mean": mean,
    "median": median,
    "std_dev": std_dev,
    "min_val": min_val, 
    "max_val": max_val
    }

    output = {
    "simulations": result.tolist(),
    "metrics": metrics
    }

    return json.dumps(output)

def test_historical(ticker_symb, num_sim, t):
    ticker = yf.Ticker(ticker_symb)
    # Explicitly use data up to 2023-12-31 for training
    close_history = ticker.history(
        start="1900-01-01",
        end="2023-12-31"
    )["Close"].to_numpy()
    
    drift = calc_drift(ticker_symb, t)
    time_adj_vol = calc_time_adj_vol(ticker_symb, t)

    result = np.zeros(num_sim)

    for i in range(num_sim):
        result[i] = close_history[-1] * math.exp(drift + time_adj_vol * npr.randn())

    return result

def data_for_testing(ticker_symb, result, confidence_level, date):
    alpha = 100 - confidence_level
    range_low = np.percentile(result, alpha / 2)
    range_high = np.percentile(result, 100 - alpha / 2)
    
    ticker = yf.Ticker(ticker_symb)
    next_date = (pd.to_datetime(date) + pd.Timedelta(days=1)).strftime("%Y-%m-%d")

    closing_price_on_date = ticker.history(start = date, end = next_date)["Close"][date]

    return closing_price_on_date, range_low, range_high
