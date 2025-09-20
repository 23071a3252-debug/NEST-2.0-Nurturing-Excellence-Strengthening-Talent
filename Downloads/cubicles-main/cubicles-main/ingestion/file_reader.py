import csv
import time

def read_stream(file_path):
    """
    Simulates real-time log ingestion by streaming CSV rows one by one.
    """
    with open(file_path, "r") as f:
        reader = csv.DictReader(f)
        for row in reader:
            yield row
            time.sleep(1)  # simulate 1 event per second
