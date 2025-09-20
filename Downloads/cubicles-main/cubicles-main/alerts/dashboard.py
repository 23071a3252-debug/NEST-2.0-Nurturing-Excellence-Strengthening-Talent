import streamlit as st
import time
import os
from pathlib import Path

# File to store alerts for dashboard to read
ALERT_LOG_FILE = "alerts.log"

def log_alert_for_dashboard(alert_data: str):
    """
    Logs alert data to a file for dashboard consumption.
    This function is called from the main pipeline when a new alert is generated.
    """
    try:
        with open(ALERT_LOG_FILE, "a", encoding='utf-8') as f:
            f.write(alert_data + "\n")
        print(f"DASHBOARD ALERT LOGGED: {alert_data}")  # Console log for debugging
    except Exception as e:
        print(f"Failed to log alert: {e}")

def run_dashboard():
    """
    Runs the Streamlit dashboard that displays real-time cyber anomaly alerts.
    Reads from ALERT_LOG_FILE and updates continuously.
    """
    st.set_page_config(page_title="Real-Time Cyber Anomaly Alerts", layout="wide")
    st.title("🚨 Real-Time Cyber Anomaly Alerts")
    
    # Initialize session state for alert history
    if 'alerts_history' not in st.session_state:
        st.session_state.alerts_history = []
    
    # Create a placeholder for dynamic content
    alert_placeholder = st.empty()
    
    st.write("---")
    st.info("Live alert feed. This dashboard updates automatically every 2 seconds.")

    # Main dashboard update loop
    while True:
        try:
            # Check if alert log file exists
            if os.path.exists(ALERT_LOG_FILE):
                # Read all alerts from the log file
                with open(ALERT_LOG_FILE, 'r', encoding='utf-8') as f:
                    all_alerts = [line.strip() for line in f.readlines() if line.strip()]
                
                # Update session state with new alerts
                new_alerts = [alert for alert in all_alerts if alert not in st.session_state.alerts_history]
                st.session_state.alerts_history.extend(new_alerts)
                
                # Keep only the last 50 alerts
                st.session_state.alerts_history = st.session_state.alerts_history[-50:]
            
            # Display alerts (newest first)
            with alert_placeholder.container():
                if st.session_state.alerts_history:
                    st.subheader(f"📋 Alert History ({len(st.session_state.alerts_history)} total)")
                    for i, alert in enumerate(reversed(st.session_state.alerts_history)):
                        st.markdown(f"""
                        <div style='background-color: #fff3cd; padding: 10px; border-radius: 5px; border-left: 5px solid #ffc107; margin: 10px 0;'>
                            🚨 <b>Alert #{len(st.session_state.alerts_history)-i}:</b> {alert}
                        </div>
                        """, unsafe_allow_html=True)
                else:
                    st.info("⏳ Waiting for alerts... The detector needs to be running.")
                    
        except Exception as e:
            st.error(f"Error reading alerts: {e}")
            
        # Wait before next update
        time.sleep(2)

if __name__ == "__main__":
    run_dashboard()