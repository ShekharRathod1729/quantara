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
    start = dt.datetime(2026,1,1)  # start date, irrelevant here but required as an argument in the DataReader function
    end = dt.datetime.today()
    r_y = 0

    # 3 month horizon, use 3-month T-bill
    if T <= 0.25:
        r_y = web.DataReader("DTB3", "fred", start, end).iloc[-1,0] / 100 # rates are returned in percentage and so division by 100
    
    # 3 to 6 month horizon, use 6-month T-bill
    elif T <= 0.5:
        r_y = web.DataReader("DTB6", "fred", start, end).iloc[-1,0] / 100
    
    # for longer time horizons, use 1-year T-bill
    else:
        r_y = web.DataReader("DTB1YR", "fred", start, end).iloc[-1,0] / 100

    r = np.log(1 + r_y)  # this is the annual riskless rate

    return r