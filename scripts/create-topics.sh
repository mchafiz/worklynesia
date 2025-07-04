#!/bin/bash

# Enable error handling
set -e
set -x

# Function to check if Kafka is ready
check_kafka_ready() {
    local max_attempts=30
    local attempt=1
    
    echo "Checking Kafka readiness..."
    while [ $attempt -le $max_attempts ]; do
        if kafka-topics --bootstrap-server $BOOTSTRAP_SERVER --list >/dev/null 2>&1; then
            echo "Kafka is ready!"
            return 0
        fi
        echo "Attempt $attempt/$max_attempts: Kafka not ready yet, waiting..."
        sleep 5
        attempt=$((attempt + 1))
    done
    
    echo "Kafka not ready after $max_attempts attempts"
    return 1
}

# Wait for Kafka to be ready
echo "Waiting for Kafka..."
check_kafka_ready || exit 1

# Configuration
REPLICATION_FACTOR=${REPLICATION_FACTOR:-1}
BOOTSTRAP_SERVER=${BOOTSTRAP_SERVER:-kafka:29092}

echo "Using bootstrap server: $BOOTSTRAP_SERVER"

# Function to create topic with verification
create_topic() {
    local topic=$1
    local partitions=$2
    local description=$3
    local max_attempts=3
    local attempt=1

    echo "Creating topic: $topic ($description) with $partitions partition(s)..."
    while [ $attempt -le $max_attempts ]; do
        if kafka-topics --create \
            --if-not-exists \
            --bootstrap-server $BOOTSTRAP_SERVER \
            --topic "$topic" \
            --partitions $partitions \
            --replication-factor $REPLICATION_FACTOR \
            --config cleanup.policy=delete \
            --config retention.ms=604800000; then
            echo "Successfully created topic: $topic"
            return 0
        else
            echo "Attempt $attempt/$max_attempts: Failed to create topic: $topic"
            sleep 5
            attempt=$((attempt + 1))
        fi
    done
    
    echo "Failed to create topic after $max_attempts attempts: $topic"
    return 1
}

echo "Starting topic creation process..."

# Create auth and profile service topics
create_topic "auth.user.registered" 1 "User registration events"
create_topic "auth.user.updated" 1 "User update events"
create_topic "auth.user.deleted" 1 "User deletion events"
create_topic "profile.user.created" 1 "Profile creation events"
create_topic "profile.user.updated" 1 "Profile update events"
create_topic "profile.user.deleted" 1 "Profile deletion events"

# Verify topics
echo -e "\nVerifying created topics..."
kafka-topics --list --bootstrap-server $BOOTSTRAP_SERVER

echo "All topics created successfully!"
