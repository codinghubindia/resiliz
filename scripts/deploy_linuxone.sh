#!/usr/bin/env bash
set -e

echo "================================================================="
echo "ResiliZ: Automated Deployment to IBM LinuxONE (s390x)"
echo "================================================================="

TARGET_HOST="linuxone"
REMOTE_DIR="~/resiliz"

echo "[1/4] Ensuring remote workspace directory on LinuxONE..."
ssh "${TARGET_HOST}" "mkdir -p ${REMOTE_DIR}"

echo "[2/4] Syncing project files to ${TARGET_HOST}:${REMOTE_DIR}..."
scp -r backend frontend scripts README.md "${TARGET_HOST}:${REMOTE_DIR}/"

echo "[3/4] Provisioning Python virtual environment & dependencies..."
ssh "${TARGET_HOST}" "bash -s" << 'EOF'
  set -e
  cd ~/resiliz/backend
  if [ ! -d "venv" ]; then
    python3 -m venv venv
  fi
  ./venv/bin/pip install --upgrade pip
  ./venv/bin/pip install -r requirements.txt
EOF

echo "[4/4] Installing frontend Node.js dependencies..."
ssh "${TARGET_HOST}" "bash -s" << 'EOF'
  set -e
  cd ~/resiliz/frontend
  npm install
EOF

echo "Deployment complete on IBM LinuxONE s390x!"
