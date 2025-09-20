from ingestion.file_reader import read_stream
from detection.rules import check_rules
from detection.stats import check_stats
from explanation.llm_explainer import generate_explanation
from alerts.slack_notifier import send_slack_alert
from alerts.dashboard import log_alert_for_dashboard
from detection.ml_models import check_ml_anomaly
from data.generator import generate_mock_logins
import os
import time

# Configuration
MOCK_LOGINS_FILE = "data/mock_logins.csv"

def main():
    print("🚀 Starting Real-Time Cyber Anomaly Detector...")
    print("Press Ctrl+C to stop.\n")

    # Ensure the data file exists
    if not os.path.exists(MOCK_LOGINS_FILE):
        print("📄 Generating mock data...")
        generate_mock_logins(MOCK_LOGINS_FILE)

    # Main detection loop
    try:
        for event in read_stream(MOCK_LOGINS_FILE):
            anomalies = []
            
            # Check for anomalies using all methods
            anomalies.extend(check_rules(event))
            anomalies.extend(check_stats(event))
            anomalies.extend(check_ml_anomaly(event))

            if anomalies:
                explanation = generate_explanation(event, anomalies)
                print(f"🚨 ALERT: {explanation}")
                
                # Send to all output channels
                send_slack_alert(explanation)
                log_alert_for_dashboard(explanation)
                
            # Small delay to prevent CPU overuse
            time.sleep(0.1)

    except KeyboardInterrupt:
        print("\n🛑 Detector stopped by user.")
    except Exception as e:
        print(f"❌ Error in detector: {e}")

if __name__ == "__main__":
    main()