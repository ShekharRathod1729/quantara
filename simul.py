import yfinance as yf
import numpy as np
import numpy.random as npr
import math
import matplotlib.pyplot as plt
import json

def simulate(ticker_symb, num_sim, t):
    ticker = yf.Ticker(ticker_symb)
    close_history = ticker.history(period="max")["Close"].to_numpy()
    daily_ret = np.log(close_history[1:]/close_history[:-1])
    drift = t * (daily_ret.mean() - daily_ret.var() / 2)
    std_dev_adj = np.sqrt(t) * np.std(daily_ret)

    result = np.zeros(num_sim)

    for i in range(num_sim):
        result[i] = close_history[-1] * math.exp(drift + std_dev_adj * npr.randn())

    return result

 
