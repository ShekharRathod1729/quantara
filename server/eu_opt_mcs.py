import yfinance as yf
import numpy as np
import numpy.random as npr
import json
from utils import volatility, calc_r


'''
T: time interval between today and maturity, in years
num_sim: number of simulations we want to perfom
K: strike price
opt: takes one of two strings, "call" or "put", "call" by default
'''

def eu_opt_mcs(ticker_symb, T, num_sim, K, opt="call"):
    ticker = yf.Ticker(ticker_symb)
    close_history = ticker.history(period="max")["Close"].to_numpy()

    r = calc_r(T)
    sigma = volatility(ticker)

    S0 = close_history[-1]
    Z = npr.randn(num_sim)

    S_T = S0 * np.exp((r - 0.5 * sigma ** 2) * T + sigma * np.sqrt(T) * Z)
    payoff = 0

    # call option
    if opt == "call":
        payoff = np.maximum(S_T - K, 0)

    # put option
    if opt == "put":
        payoff = np.maximum(K - S_T, 0)

    # discounting
    price = np.exp(-r * T) * np.mean(payoff)

    return price, payoff


'''
    Converting output to JSON
'''

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

