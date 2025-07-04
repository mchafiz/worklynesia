#!/bin/bash
set -e

# Create directories
mkdir -p /var/lib/kafka/data /var/lib/kafka/kraft-metadata

# Format storage
kafka-storage format \
  --config /etc/kafka/kraft/server.properties \
  --cluster-id "${CLUSTER_ID}" \
  --ignore-formatted

# Start Kafka
exec /etc/confluent/docker/run
