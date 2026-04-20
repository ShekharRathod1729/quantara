# quantara
Web application for simulating future stock prices using Monte Carlo methods and delivering actionable financial insights.

## Features

- **Single Stock Simulation** - Monte Carlo simulation of future stock prices
- **Portfolio Simulation** - Simulate a portfolio of multiple weighted stocks
- **European Option Pricing** - Price European call/put options using Monte Carlo Simulation or Binomial Trees
- **American Put Option Pricing** - Price American put options using Binomial Trees with early exercise analysis
- **Historical Testing** - Backtest simulation accuracy against historical data

## How to Run

### Prerequisites

- Python 3.10+
- Node.js 18+

### Backend (Flask server)

```bash
cd server
pip install flask flask-cors yfinance numpy pandas pandas-datareader numba
python app.py
```

The server runs at `http://127.0.0.1:5000`.

### Frontend (React client)

```bash
cd client
npm install
npm run dev
```

The client runs at `http://localhost:5173` (Vite default).

### Running Both

Open two terminal windows and start the backend and frontend as described above. Then navigate to `http://localhost:5173` in your browser.
