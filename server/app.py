from flask import Flask, request, jsonify
from flask_cors import CORS
from simulation import simulate, to_json, simulate_multiple, test_historical, data_for_testing
import pandas as pd

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
        # use yfinance via simulation module or directly here
        import yfinance as yf
        df = yf.Ticker(ticker).history(start=start, end=end)
        if df.empty:
            return jsonify({"error": "no data for given range"}), 404
        # convert to JSON serializable form (ISO dates)
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
        from pandas.tseries.offsets import BDay
        
        cutoff_date = pd.Timestamp("2023-12-31")
        target_date = pd.Timestamp(date)
        
        # Validate date is after cutoff
        if target_date <= cutoff_date:
            return jsonify({"error": "Date must be after 2023-12-31"}), 400
        
        # Calculate number of business days between cutoff and target date
        # This excludes the start date and includes the end date
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

if __name__ == "__main__":
    app.run(debug=True)
