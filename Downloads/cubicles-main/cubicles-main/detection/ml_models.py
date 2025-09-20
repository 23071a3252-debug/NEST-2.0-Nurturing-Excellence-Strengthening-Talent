# detection/ml_models.py

def check_ml_anomaly(event):
    """
    Placeholder for ML-based anomaly detection.
    For now, it returns a list of anomalies (empty if none).
    In a real system, you’d load a trained model here.
    """
    anomalies = []

    # Example heuristic: flag suspicious login failures
    if event.get("status") == "FAILURE":
        anomalies.append("ML Model flagged: unusual login failure")

    # You can expand this later with a real ML model
    return anomalies
