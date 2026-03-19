import numpy as np
import yfinance as yf
from utils import volatility, calc_r
import utils_bt
import json


'''
Calculating the binomial tree for simulating the option price. 
S: ndarray representing the binomial tree for stock price, calculated using function stock_bt()
K: strike price
p: risk-neutral probability of the stock going up
df: discount factor, exp(-r * dt)
'''

def option_bt(S, K, p, df):
    O = np.zeros_like(S)
    early_optimal = set()
    rows, cols = S.shape
    T = cols - 1  # last time period

    # valuing the option at time T (maturity)
    for row in range(rows):
        O[row, T] = max(K - S[row, T], 0)

    # working backwards in the lattice
    t = T - 1
    while t >= 0:
        for row in range(t + 1):
            exp_value = df * (p * O[row, t + 1] + (1 - p) * O[row + 1, t + 1])
            early_exercise = max(0, K - S[row, t])
            O[row, t] = max(exp_value, early_exercise)

            if early_exercise > exp_value:
                early_optimal.add((row, t))
        t -= 1

    return O, early_optimal


'''
Pricing an American put option.
ticker_symb: string representing a ticker symbol like "AAPL"
K: strike price
T: time (in years) till maturity
N: number of periods
'''

def am_put_bt(ticker_symb, K, T, N):
    ticker = yf.Ticker(ticker_symb)

    sigma = volatility(ticker)
    dt = T / N  # length of each period
    r = calc_r(T)  # riskless rate

    S0 = ticker.history(period="5d")["Close"].iloc[-1]
    u = np.exp(sigma * np.sqrt(dt))

    S = utils_bt.stock_bt(S0, u, N)  # stock binomial tree

    p = utils_bt.calc_p(r, dt, u)
    df = np.exp(-r * dt)

    O, early_optimal = option_bt(S, K, p, df)

    return S, O, early_optimal


'''
Converting data to JSON
'''

def to_json(S, O, early_optimal):
    output = {
        "stock_bt": S.tolist(),
        "opt_bt": O.tolist(),
        "early_optimal": early_optimal.tolist()
    }
    return json.dumps(output)
