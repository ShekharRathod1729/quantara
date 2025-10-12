from flask import Flask, request, jsonify
from flask_cors import CORS   # 👈 Import CORS
import yfinance as yf
import numpy as np
import numpy.random as npr
import math
import json

app = Flask(__name__)
CORS(app)  # 👈 Allow all origins (you can restrict later if needed)

@app.route("/")
def home():
    return "✅ Flask Monte Carlo Stock Simulator is running!"


def to_json(result):
    """Convert numpy simulation results into JSON with summary statistics."""
    metrics = {
        "mean": float(np.mean(result)),
        "median": float(np.median(result)),
        "std_dev": float(np.std(result)),
        "min_val": float(np.min(result)),
        "max_val": float(np.max(result))
    }

    output = {
        "simulations": result.tolist(),
        "metrics": metrics
    }

    return json.dumps(output)


@app.route("/simul", methods=["GET"])
def simulate():
    """Monte Carlo stock price simulation API endpoint."""
    try:
        # --- Get query parameters ---
        ticker_symb = request.args.get("ticker", default="AAPL", type=str)
        num_sim = request.args.get("num_sim", default=1000, type=int)
        t = request.args.get("t", default=1.0, type=float)

        # --- Fetch stock data ---
        ticker = yf.Ticker(ticker_symb)
        close_history = ticker.history(period="max")["Close"].to_numpy()

        if len(close_history) < 2:
            return jsonify({"error": "Not enough historical data for this ticker."}), 400

        # --- Calculate log returns ---
        daily_ret = np.log(close_history[1:] / close_history[:-1])

        # --- Calculate drift and volatility ---
        drift = t * (daily_ret.mean() - (daily_ret.var() / 2))
        std_dev_adj = np.sqrt(t) * np.std(daily_ret)

        # --- Run simulations (vectorized) ---
        random_factors = npr.randn(num_sim)
        result = close_history[-1] * np.exp(drift + std_dev_adj * random_factors)

        # --- Return JSON output ---
        return app.response_class(
            response=to_json(result),
            status=200,
            mimetype="application/json"
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
