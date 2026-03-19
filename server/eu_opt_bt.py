import numpy as np
from utils import volatility, calc_r
import utils_bt
import yfinance as yf
import json


'''
Calculating the binomial tree for simulating the option price. 
S: ndarray representing the binomial tree for stock price, calculated using function stock_bt_nb()
K: strike price
p: risk-neutral probability of the stock going up
df: discount factor, exp(-r * dt)
opt: takes the strings "call" or "put" as an argument, "call" by default
'''

def option_bt(S, K, p, df, opt="call"):
    O = np.zeros_like(S)
    rows, cols = S.shape
    T = cols - 1  # last time period
    
    # valuing the option at time T (maturity)
    if opt == "put":
        for row in range(rows):
            O[row, T] = max(K - S[row, T], 0)

    if opt == "call":
        for row in range(rows):
            O[row, T] = max(S[row, T] - K, 0)
    
    # working backwards in the lattice
    t = T - 1
    while t >= 0:
        for row in range(t + 1):
            O[row, t] = df * (p * O[row, t + 1] + (1 - p) * O[row + 1, t + 1])

        t -= 1
    
    return O


'''
Pricing a European option.
ticker_symb: string representing a ticker symbol like "AAPL"
K: strike price
T: time (in years) till maturity
N: number of periods
opt: takes one of two strings, "call" or "put", "call" by default
'''

def eu_opt_bt(ticker_symb, T, N, K, opt="call"):
    
    ticker = yf.Ticker(ticker_symb)
    sigma = volatility(ticker)
    dt = T / N     # length of each period
    r = calc_r(T)  # riskless rate

    S0 = ticker.history(period="5d")["Close"].iloc[-1]
    u = np.exp(sigma * np.sqrt(dt))

    S = utils_bt.stock_bt(S0, u, N)  # stock binomial tree

    p = utils_bt.calc_p(r, dt, u)
    df = np.exp(-r * dt)

    O = option_bt(S, K, p, df, opt)

    return S, O


'''
Converting data to JSON
'''

def to_json(S, O):
    output = {
        "stock_bt": S.tolist(),
        "opt_bt": O.tolist(),
    }
    return json.dumps(output)
