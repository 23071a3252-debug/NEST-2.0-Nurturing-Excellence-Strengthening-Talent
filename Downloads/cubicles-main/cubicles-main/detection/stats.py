import statistics

# maintain baseline history
values = []

def check_stats(event):
    anomalies = []
    val = int(event.get("logins_last_minute", 0))
    
    values.append(val)
    if len(values) > 20:  # keep rolling window
        values.pop(0)

    if len(values) > 5:
        mean = statistics.mean(values)
        stdev = statistics.pstdev(values)
        if stdev > 0 and abs(val - mean) > 3 * stdev:
            anomalies.append(f"Statistical anomaly: {val} vs avg {round(mean,2)}")

    return anomalies
