import numpy as np
import yfinance as yf
from utils import volatility, calc_r


'''
Calculating the risk-neutral probability p
r: risk-free rate
dt: length of each time step (in years)
u: calculated by calc_u
'''

def calc_p(r, dt, u):
    d = 1 / u
    return (np.exp(r * dt) - d) / (u - d)


'''
Calculating the binomial tree for simulating stock prices.
S0: current stock price
u: calculated by calc_u
N: number of periods
'''

def stock_bt(S0, u, N):
    d = 1 / u
    S = np.zeros((N + 1, N + 1))
    S[0, 0] = S0

    for i in range(0, N + 1):
        for t in range(i, N + 1):
            if i == t == 0:
                continue
            if i == t:
                S[i, t] = d * S[i - 1, t - 1]
            else:
                S[i, t] = u * S[i, t - 1]

    return S


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

def price_am_put(ticker_symb, K, T, N):
    ticker = yf.Ticker(ticker_symb)

    sigma = volatility(ticker)
    dt = T / N  # length of each period
    r = calc_r(T)  # riskless rate

    S0 = ticker.history(period="5d")["Close"].iloc[-1]
    u = np.exp(sigma * np.sqrt(dt))

    S = stock_bt(S0, u, N)  # stock binomial tree

    p = calc_p(r, dt, u)
    df = np.exp(-r * dt)

    O = option_bt(S, K, p, df)[0]

    return O