def send_slack_alert(message):
    """
    Simple console alerting (no Slack webhook needed)
    """
    print(f"🚨 SECURITY ALERT: {message}")
    # Basic file logging
    try:
        with open("security_alerts.log", "a", encoding='utf-8') as f:
            f.write(f"{message}\n")
    except:
        pass