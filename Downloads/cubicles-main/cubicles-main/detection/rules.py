def check_rules(event):
    """
    Apply simple rule-based anomaly checks.
    """
    anomalies = []
    
    # Example rules
    if event.get("location") not in ["Delhi", "Mumbai"]:
        anomalies.append("Unusual login location")

    if int(event.get("logins_last_minute", 0)) > 100:
        anomalies.append("Login spike detected")

    if int(event.get("data_transfer_mb", 0)) > 500:
        anomalies.append("Large data transfer")

    return anomalies
