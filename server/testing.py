import yfinance as yf
import numpy as np
import pandas as pd
import json


'''
    Testing simulated prices against the actual stock price
    
    ticker: string representing ticker symbol of stock ("AAPL")
    start: starting date as a string in the format "2025-01-01" ("yyyy-mm-dd")
    end: ending date as a string in the format "2025-02-01"
    num_sim: number of simulations

    This function returns an ndarray exp_terminal, which are simulated terminal prices on end date,
    calculated using start date as the initial point.
    It also returns actual_terminal, which is the real-world stock price on the end date. 
'''

def test_stock(ticker, start, end, num_sim):

    history = yf.Ticker(ticker).history(period="10y")["Close"]

    start_ts = pd.Timestamp(start, tz='America/New_York')
    end_ts = pd.Timestamp(end, tz='America/New_York')

    start_ts = history.index[history.index >= start_ts][0]
    end_ts = history.index[history.index <= end_ts][-1]

    S0 = history.loc[start_ts]
    actual_terminal = history.loc[end_ts]

    T = np.busday_count(start, end) / 252

    data_start = start_ts - pd.DateOffset(years=2)

    data_start = history.index[history.index >= data_start][0]

    data = history.loc[data_start:start_ts].to_numpy()
    ret = np.log(data[1:] / data[:-1])

    mu = np.mean(ret) * 252
    sigma = np.std(ret) * np.sqrt(252)

    exp_terminal = S0 * np.exp((mu - 0.5 * sigma * sigma) * T + sigma * np.sqrt(T) * np.random.randn(num_sim))

    return float(S0), actual_terminal, exp_terminal



'''
    exp_terminal: the ndarray returned by test_stock
'''
def data_for_testing(exp_terminal, confidence_level):
    alpha = 100 - confidence_level
    range_low = np.percentile(exp_terminal, alpha / 2)
    range_high = np.percentile(exp_terminal, 100 - alpha / 2)

    return range_low, range_high

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


