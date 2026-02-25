import yfinance as yf
import numpy as np
import numpy.random as npr
import math
import pandas as pd
import pandas_datareader.data as web
import datetime as dt
import json


'''
Calculating the daily log returns of a stock.
ticker_symb: string representing a ticker symbol like "AAPL"
Returns an ndarray containing the daily log returns of the stock.
'''

def calc_daily_log_return(ticker_symb):
    ticker = yf.Ticker(ticker_symb)  # returns a Ticker object

    # The history() method of a Ticker object returns a Pandas DataFrame which is converted to an ndarray by the method to_numpy()
    close_history = ticker.history(period="max")["Close"].to_numpy()
    
    daily_log_return = np.log(close_history[1:]/close_history[:-1])

    return daily_log_return

'''
This function takes t, the time interval between today and maturity, in days.
'''

def calc_r(t):
    start = dt.datetime(2026,1,1)  # start date, irrelevant here but required as an argument in the DataReader function
    end = dt.datetime.today()
    r = 0

    # 3 month horizon, use 3-month T-bill
    if t <= 75:
        r = web.DataReader("DTB3", "fred", start, end).iloc[-1,0] / 100 # rates are returned in percentage and so division by 100
    
    # 3 to 9 month horizon, use 6-month T-bill
    elif t <= 225:
        r = web.DataReader("DTB6", "fred", start, end).iloc[-1,0] / 100
    
    # for longer time horizons, use 1-year T-bill
    else:
        r = web.DataReader("DTB1YR", "fred", start, end).iloc[-1,0] / 100

    r_c = np.log(1 + r)  # this is the annual riskless rate

    return r_c    

'''
t: time interval between today and maturity, in days
num_sim: number of simulations we want to perfom
K: strike price
call: boolean value, true if a call option, false if a put option
'''

def simulate(ticker_symb, t, num_sim, K, call):
    ticker = yf.Ticker(ticker_symb)
    close_history = ticker.history(period="max")["Close"].to_numpy()
    daily_ret = calc_daily_log_return(ticker_symb)
    
    r = calc_r(t)
    sigma = np.std(daily_ret, ddof=1) * np.sqrt(252)  # np.std(daily_ret) gives daily volatility, multiply by sqrt(252) to obtain annual volatility

    # Since r is annual, we divide t by 252 (no. of working days in a year)
    T = t / 252

    S0 = close_history[-1]
    Z = npr.randn(num_sim)
    
    S_T = S0 * np.exp((r - 0.5 * sigma ** 2) * T + sigma * np.sqrt(T) * Z)
    
    # call option
    if call:
        payoff = np.maximum(S_T - K, 0)

    # put option
    else:
        payoff = np.maximum(K - S_T, 0)
        
    # discounting
    price = np.exp(-r * T) * np.mean(payoff)
    
    return price, payoff

def to_json(payoff, price):
    mean = float(np.mean(payoff))
    median = float(np.median(payoff))
    std_dev = float(np.std(payoff, ddof=1))
    min_val = float(np.min(payoff))
    max_val = float(np.max(payoff))

    metrics = {
            "mean": mean,
            "median": median,
            "std_dev": std_dev,
            "min_val": min_val,
            "max_val": max_val
    }

    output = {
            "payoffs": payoff.tolist(),
            "metrics": metrics,
            "price": float(price)
    }

    return json.dumps(output)

