from flask import Flask, request, jsonify
from flask_cors import CORS
from simulation import simulate, to_json

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

if __name__ == "__main__":
    app.run(debug=True)
