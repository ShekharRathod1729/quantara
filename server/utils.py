import numpy as np
import yfinance as yf


'''
Calculating the daily log returns of a stock.
ticker: a Ticker object
Returns an ndarray containing the daily log returns of the stock.
'''

def calc_daily_log_return(ticker):
    # The history() method of a Ticker object returns a Pandas DataFrame which is converted to an ndarray by the method to_numpy()
    close_history = ticker.history(period="2y")["Close"].to_numpy()

    daily_log_return = np.log(close_history[1:] / close_history[:-1])

    return daily_log_return


'''
Calculating the volatility of the stock price.
Takes as input a Ticker object.
'''

def volatility(ticker):

    daily_ret = calc_daily_log_return(ticker)
    sigma = np.std(daily_ret, ddof=1) * np.sqrt(252) # np.std(daily_ret) gives the daily volatility, multiply by sqrt(252) to obtain the annual volatility

    return sigma


'''
This function takes T, the time interval between today and maturity, in years.
'''

def calc_r(T):
    # Use Yahoo Finance treasury indices to avoid FRED dependency/timeouts.
    # ^IRX ~= 13-week bill, ^FVX ~= 5-year note, ^TNX ~= 10-year note.
    if T <= 0.25:
        ticker = "^IRX"
    elif T <= 1.0:
        ticker = "^FVX"
    else:
        ticker = "^TNX"

    try:
        data = yf.Ticker(ticker).history(period="5d")
        r_y = float(data["Close"].dropna().iloc[-1]) / 100.0
    except Exception:
        # Conservative fallback to keep pricing APIs available when data source is unavailable.
        r_y = 0.043

    return float(np.log(1 + r_y))

