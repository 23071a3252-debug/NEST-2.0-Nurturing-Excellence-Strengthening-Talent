import requests
import time

def read_from_api(url, poll_interval=2):
    """
    Polls a REST API endpoint for JSON events in real time.
    Assumes endpoint returns a list of events.
    """
    while True:
        try:
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                events = response.json()
                for event in events:
                    yield event
        except Exception as e:
            print("API ingest error:", e)
        time.sleep(poll_interval)
