import csv
import random
import os

def generate_mock_logins(file_path="data/mock_logins.csv", num_records=20):
    """
    Generate a mock logins CSV file with random login events.
    Each record will have: timestamp, username, ip_address, and status.
    """
    os.makedirs(os.path.dirname(file_path), exist_ok=True)

    usernames = ["alice", "bob", "charlie", "dave", "eve"]
    statuses = ["SUCCESS", "FAILURE"]

    with open(file_path, mode="w", newline="") as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(["timestamp", "username", "ip_address", "status"])  # header

        for i in range(num_records):
            timestamp = f"2025-09-20 12:{i:02d}:00"
            username = random.choice(usernames)
            ip_address = f"192.168.0.{random.randint(1, 255)}"
            status = random.choices(statuses, weights=[0.7, 0.3])[0]  # mostly successes
            writer.writerow([timestamp, username, ip_address, status])

    print(f"✅ Generated mock login data at {file_path}")
