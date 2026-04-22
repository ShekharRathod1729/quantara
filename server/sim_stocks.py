import numpy as np
import numpy.random as npr
import yfinance as yf
import num_methods as nm
import json



'''
tickers: a list of strings like ["AAPL", "MSFT"]
T: time in years
weights: weights[i] denotes what fraction of the basket is the i-th stock; value between 0 and 1, sum(weights) = 1
num_sim: number of simulations 
N: number of time intervals in which T is divided
 
Returns a (N + 1)x(num_sim) ndarray, where each column contains a simulated path
'''

def simulate(tickers, T, weights, num_sim, N):
    if len(tickers) == 1:
        return sim_path_stock(tickers[0], T, num_sim, N)

    return stock_basket_path(tickers, T, weights, num_sim, N)



'''
Simulating the path of the stock price.
tick_symb: ticker symbol of the stock (string)
T: time period (in years) 
num_sim: number of simulations
N: number of time intervals in which T is divided

Returns a (N + 1)x(num_sim) ndarray, where each column contains a simulated path
'''

def sim_path_stock(tick_symb, T, num_sim, N):
    dt = T / N
    
    history = yf.Ticker(tick_symb).history(period="2y")["Close"].to_numpy()
    log_returns = np.log(history[1:] / history[:-1])

    mu = np.mean(log_returns) * 252
    sigma = np.std(log_returns) * np.sqrt(252)

    paths = np.zeros((N + 1, num_sim))
    paths[0] = history[-1]

    for t in range(1, N + 1):
        paths[t] = paths[t - 1] * np.exp((mu - 0.5 * sigma * sigma) * dt + sigma * np.sqrt(dt) * npr.randn(num_sim))

    return paths



'''
Simulating paths followed by the price of the basket of stocks.

tickers: a list of strings like ["AAPL", "MSFT"]
T: time in years
weights: weights[i] denotes what fraction of the basket is the i-th stock; value between 0 and 1, sum(weights) = 1
num_sim: number of simulations 
num_int: number of intervals

'''

def stock_basket_path(tickers, T, weights, num_sim, num_int):
    dt = T / num_int   # length of each interval
    num_stocks = len(tickers)
                    
    hist = yf.Tickers(tickers).history(period="2y")["Close"].to_numpy().T
    price_data = np.zeros((num_stocks, num_int + 1, num_sim))
    curr_stock_prices = hist[:, -1].reshape(-1, 1)

    for i in range(0, num_stocks):
        price_data[i, 0, :] = curr_stock_prices[i]

    R = np.log(hist[:, 1:] / hist[:, :-1])

    means = np.mean(R, axis=1).reshape(-1, 1) * 252
    sigma = np.std(R, axis=1).reshape(-1, 1) * np.sqrt(252)
    cov_mat = nm.cov(R) * 252

    L = nm.cholesky(cov_mat)

    for t in range(1, num_int + 1):
        Z = np.random.randn(num_stocks, num_sim)
        X = L @ Z

        price_data[:, t, :] = price_data[:, t - 1, :] * np.exp((means - 0.5 * sigma ** 2) * dt + np.sqrt(dt) * X)

    weights = np.array(weights).reshape(-1, 1, 1)
    basket_paths = np.sum(weights * price_data, axis = 0)
    
    return basket_paths



'''
Converting output to JSON
'''

def to_json(paths):
    terminal = paths[-1]
    
    mean = float(np.mean(terminal))
    median = float(np.median(terminal))
    std = float(np.std(terminal))
    min_val = float(np.min(terminal))
    max_val = float(np.max(terminal))

    metrics = {
    "mean": mean,
    "median": median,
    "std_dev": std_dev,
    "min_val": min_val, 
    "max_val": max_val
    }
    
    output = {
        "paths": paths.tolist(),
        "terminal": terminal.tolist(),
        "metrics": metrics
    }

    return json.dumps(output)
