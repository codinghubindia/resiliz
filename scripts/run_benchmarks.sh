#!/usr/bin/env bash
set -e

TARGET_HOST="linuxone"
echo "Running ML Pipeline training and benchmark natively on LinuxONE s390x..."
ssh "${TARGET_HOST}" "cd ~/resiliz/backend && ./venv/bin/python3 ml/train_pipeline.py"

echo "Copying benchmark metrics back to local workspace..."
scp "${TARGET_HOST}:~/resiliz/backend/ml/models/benchmark_metrics.json" "./backend/ml/models/benchmark_metrics.json"

echo "Benchmark complete! Metrics synced locally."
