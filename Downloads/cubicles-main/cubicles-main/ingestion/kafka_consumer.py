from kafka import KafkaConsumer
import json

def read_from_kafka(topic, bootstrap_servers="localhost:9092", group_id="anomaly-detector"):
    """
    Consumes messages from a Kafka topic.
    Each message should be a JSON string.
    """
    consumer = KafkaConsumer(
        topic,
        bootstrap_servers=bootstrap_servers,
        group_id=group_id,
        value_deserializer=lambda m: json.loads(m.decode("utf-8")),
        auto_offset_reset="latest"
    )

    for message in consumer:
        yield message.value
