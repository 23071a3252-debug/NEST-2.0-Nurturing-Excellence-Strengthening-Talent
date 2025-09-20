def generate_explanation(event, anomalies):
    """
    Generate simple human-friendly explanations without external APIs
    """
    user = event.get("user", "unknown")
    location = event.get("location", "unknown")
    timestamp = event.get("timestamp", "unknown")
    
    # Create simple descriptive explanations
    anomaly_text = ", ".join(anomalies)
    return f"Suspicious activity: User {user} from {location} at {timestamp} - {anomaly_text}"