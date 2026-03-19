import numpy as np
import yfinance as yf
import json


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
    cov_mat = np.cov(R) * 252

    L = np.linalg.cholesky(cov_mat)

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

def to_json(basket_paths):
    output = {
        "basket_paths": basket_paths.tolist()
    }

    return json.dumps(output)
