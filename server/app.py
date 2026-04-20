# ============================================================
# Compatibility patches — must run before ANY other imports
# ============================================================
import sys
import types
import functools

# 1) Restore distutils.version (removed in Python 3.12+)
try:
    from distutils.version import LooseVersion  # noqa: F401
except ModuleNotFoundError:
    from packaging.version import Version as _PkgVersion

    class LooseVersion:
        def __init__(self, vstring):
            self._v = _PkgVersion(str(vstring))
        def __lt__(self, o): return self._v < _PkgVersion(str(o))
        def __le__(self, o): return self._v <= _PkgVersion(str(o))
        def __eq__(self, o): return self._v == _PkgVersion(str(o))
        def __ge__(self, o): return self._v >= _PkgVersion(str(o))
        def __gt__(self, o): return self._v > _PkgVersion(str(o))
        def __repr__(self): return str(self._v)

    dv = types.ModuleType("distutils.version")
    dv.LooseVersion = LooseVersion
    sys.modules.setdefault("distutils", types.ModuleType("distutils"))
    sys.modules["distutils.version"] = dv

# 2) Patch deprecate_kwarg for pandas_datareader compat with pandas 2.x
import pandas.util._decorators as _pd_dec
_orig_dk = _pd_dec.deprecate_kwarg

def _patched_dk(old_arg_name, new_arg_name=None, *a, **kw):
    try:
        return _orig_dk(old_arg_name, new_arg_name=new_arg_name, *a, **kw)
    except TypeError:
        def decorator(fn):
            @functools.wraps(fn)
            def wrapper(*args, **kwargs):
                return fn(*args, **kwargs)
            return wrapper
        return decorator

_pd_dec.deprecate_kwarg = _patched_dk

# ============================================================
# Imports
# ============================================================
from flask import Flask, request, jsonify
from flask_cors import CORS
from simulation import simulate, to_json, simulate_multiple, test_historical, data_for_testing
from eu_opt_mcs import eu_opt_mcs, to_json as eu_mcs_to_json
from eu_opt_bt import eu_opt_bt, to_json as eu_bt_to_json
from am_put_bt import am_put_bt
import pandas as pd
import numpy as np
import json
import yfinance as yf

# ============================================================
# Replace calc_r everywhere — FRED/pandas_datareader times out,
# so use yfinance Treasury tickers instead.
# ============================================================
def calc_r_yf(T):
    """
    Risk-free rate using yfinance Treasury data.
    ^IRX = 13-week T-bill, ^FVX = 5-yr note, ^TNX = 10-yr note.
    Falls back to a reasonable 4.3% if yfinance also fails.
    """
    try:
        if T <= 0.25:
            ticker = "^IRX"       # 13-week T-bill
        elif T <= 1.0:
            ticker = "^FVX"       # 5-year note (proxy for 6m–1yr)
        else:
            ticker = "^TNX"       # 10-year note
        data = yf.Ticker(ticker).history(period="5d")
        r_y = float(data["Close"].iloc[-1]) / 100.0
    except Exception:
        r_y = 0.043               # fallback ≈ current T-bill range
    return float(np.log(1 + r_y))

# Monkey-patch into every module that imported calc_r from utils
import utils
import eu_opt_mcs as _eu_mcs_mod
import eu_opt_bt  as _eu_bt_mod
import am_put_bt  as _am_bt_mod

utils.calc_r         = calc_r_yf
_eu_mcs_mod.calc_r   = calc_r_yf
_eu_bt_mod.calc_r    = calc_r_yf
_am_bt_mod.calc_r    = calc_r_yf

# ============================================================
# Flask app
# ============================================================
app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return "Flask Monte Carlo Stock Simulator is running!"

@app.route("/simul", methods=["GET"])
def run_simulation():
    ticker = request.args.get("ticker", "AAPL")
    num_sim = int(request.args.get("num_sim", 1000))
    t = float(request.args.get("t", 1.0))

    try:
        result = simulate(ticker, num_sim, t)
        return app.response_class(
            response=to_json(result),
            status=200,
            mimetype="application/json"
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# New: portfolio simulation (POST JSON)
@app.route("/simul/portfolio", methods=["POST"])
def run_portfolio_simulation():
    """
    Expects JSON:
    {
      "stocks": ["AAPL","MSFT"],
      "weights": [0.6,0.4],
      "num_sim": 1000,
      "t": 1.0
    }
    """
    try:
        payload = request.get_json(force=True)
        stocks = payload.get("stocks")
        weights = payload.get("weights")
        num_sim = int(payload.get("num_sim", 1000))
        t = float(payload.get("t", 1.0))

        if not stocks or not weights or len(stocks) != len(weights):
            return jsonify({"error": "stocks and weights required and must have same length"}), 400

        result = simulate_multiple(stocks, weights, num_sim, t)
        return app.response_class(response=to_json(result), status=200, mimetype="application/json")
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# New: fetch historical data for a ticker
@app.route("/historical", methods=["GET"])
def get_historical():
    """
    Query params:
      ticker (required), start (YYYY-MM-DD), end (YYYY-MM-DD)
    Returns JSON of historical Close (and other columns returned by yfinance).
    """
    ticker = request.args.get("ticker")
    if not ticker:
        return jsonify({"error": "ticker required"}), 400

    start = request.args.get("start", None)
    end = request.args.get("end", None)

    try:
        df = yf.Ticker(ticker).history(start=start, end=end)
        if df.empty:
            return jsonify({"error": "no data for given range"}), 404
        return app.response_class(response=df.to_json(date_format="iso"), status=200, mimetype="application/json")
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Updated: historical testing with automatic business day calculation
@app.route("/historical/test", methods=["GET"])
def historical_test():
    """
    Query params:
      ticker (required), date (YYYY-MM-DD, must be after 2023-12-31 and a US business day),
      num_sim (default 1000), confidence (default 95)
    Returns: closing price on date and confidence interval from simulation.
    """
    ticker = request.args.get("ticker")
    date = request.args.get("date")
    if not ticker or not date:
        return jsonify({"error": "ticker and date required"}), 400

    num_sim = int(request.args.get("num_sim", 1000))
    confidence = float(request.args.get("confidence", 95.0))

    try:
        cutoff_date = pd.Timestamp("2023-12-31")
        target_date = pd.Timestamp(date)

        # Validate date is after cutoff
        if target_date <= cutoff_date:
            return jsonify({"error": "Date must be after 2023-12-31"}), 400

        # Calculate number of business days between cutoff and target date
        business_days = len(pd.bdate_range(start=cutoff_date, end=target_date)) - 1

        if business_days <= 0:
            return jsonify({"error": "Selected date must be a US business day after 2023-12-31"}), 400

        t = float(business_days)

        # Run simulation based on historical data up to 2023-12-31
        result = test_historical(ticker, num_sim, t)

        # Get actual closing price and confidence interval
        close_on_date, range_low, range_high = data_for_testing(ticker, result, confidence, date)

        return jsonify({
            "ticker": ticker,
            "date": date,
            "business_days": business_days,
            "actual_price": round(float(close_on_date), 2),
            "confidence_level": confidence,
            "range_low": round(float(range_low), 2),
            "range_high": round(float(range_high), 2),
            "within_range": float(range_low) <= float(close_on_date) <= float(range_high)
        }), 200
    except KeyError as ke:
        return jsonify({"error": f"No data available for {date}. Ensure it's a US business day."}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/options/european/mcs", methods=["POST"])
def european_option_mcs():
    """
    Expects JSON:
    {
      "ticker": "AAPL",
      "maturity_date": "2026-10-15",
      "strike_price": 200,
      "option_type": "call",
      "num_sim": 10000
    }
    """
    try:
        payload = request.get_json(force=True)
        ticker = payload.get("ticker")
        maturity_date = payload.get("maturity_date")
        strike_price = float(payload.get("strike_price"))
        option_type = payload.get("option_type", "call")
        num_sim = int(payload.get("num_sim", 10000))

        if not ticker or not maturity_date or strike_price is None:
            return jsonify({"error": "ticker, maturity_date, and strike_price are required"}), 400

        today = pd.Timestamp.today().normalize()
        maturity = pd.Timestamp(maturity_date)
        business_days = len(pd.bdate_range(start=today, end=maturity)) - 1

        if business_days <= 0:
            return jsonify({"error": "Maturity date must be a future business day"}), 400

        T = business_days / 252.0

        price, payoff = eu_opt_mcs(ticker, T, num_sim, strike_price, option_type)

        result_json = eu_mcs_to_json(payoff, price)
        result = json.loads(result_json)
        result["business_days"] = business_days
        result["T_years"] = round(T, 6)

        return app.response_class(
            response=json.dumps(result),
            status=200,
            mimetype="application/json"
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/options/european/bt", methods=["POST"])
def european_option_bt():
    """
    Expects JSON:
    {
      "ticker": "AAPL",
      "maturity_date": "2026-10-15",
      "strike_price": 200,
      "option_type": "call",
      "num_periods": 100
    }
    """
    try:
        payload = request.get_json(force=True)
        ticker = payload.get("ticker")
        maturity_date = payload.get("maturity_date")
        strike_price = float(payload.get("strike_price"))
        option_type = payload.get("option_type", "call")
        num_periods = int(payload.get("num_periods", 100))

        if not ticker or not maturity_date or strike_price is None:
            return jsonify({"error": "ticker, maturity_date, and strike_price are required"}), 400

        today = pd.Timestamp.today().normalize()
        maturity = pd.Timestamp(maturity_date)
        business_days = len(pd.bdate_range(start=today, end=maturity)) - 1

        if business_days <= 0:
            return jsonify({"error": "Maturity date must be a future business day"}), 400

        T = business_days / 252.0

        S, O = eu_opt_bt(ticker, T, num_periods, strike_price, option_type)

        result_json = eu_bt_to_json(S, O)
        result = json.loads(result_json)
        result["option_price"] = float(O[0, 0])
        result["business_days"] = business_days
        result["T_years"] = round(T, 6)

        return app.response_class(
            response=json.dumps(result),
            status=200,
            mimetype="application/json"
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/options/american/put", methods=["POST"])
def american_put_option():
    """
    Expects JSON:
    {
      "ticker": "AAPL",
      "maturity_date": "2026-10-15",
      "strike_price": 200,
      "num_periods": 100
    }
    """
    try:
        payload = request.get_json(force=True)
        ticker = payload.get("ticker")
        maturity_date = payload.get("maturity_date")
        strike_price = float(payload.get("strike_price"))
        num_periods = int(payload.get("num_periods", 100))

        if not ticker or not maturity_date or strike_price is None:
            return jsonify({"error": "ticker, maturity_date, and strike_price are required"}), 400

        today = pd.Timestamp.today().normalize()
        maturity = pd.Timestamp(maturity_date)
        business_days = len(pd.bdate_range(start=today, end=maturity)) - 1

        if business_days <= 0:
            return jsonify({"error": "Maturity date must be a future business day"}), 400

        T = business_days / 252.0

        S, O, early_optimal = am_put_bt(ticker, strike_price, T, num_periods)

        result = {
            "stock_bt": S.tolist(),
            "opt_bt": O.tolist(),
            "early_optimal": [list(point) for point in early_optimal],
            "option_price": float(O[0, 0]),
            "business_days": business_days,
            "T_years": round(T, 6)
        }

        return app.response_class(
            response=json.dumps(result),
            status=200,
            mimetype="application/json"
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
