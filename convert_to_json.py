def to_json(result):
    mean = float(np.mean(result))
    median = float(np.median(result))
    std_dev = float(np.std(result))
    min_val = float(np.min(result))
    max_val = float(np.max(result))

    metrics = {
    "mean": mean,
    "median": median,
    "std_dev": std_dev,
    "min_val": min_val, 
    "max_val": max_val
    }

    output = {
    "simulations": result.tolist(),
    "metrics": metrics
    }

    return json.dumps(output)
