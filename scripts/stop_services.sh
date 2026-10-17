#!/usr/bin/env bash
TARGET_HOST="linuxone"
echo "Stopping ResiliZ services on IBM LinuxONE..."
ssh "${TARGET_HOST}" "pkill -f 'uvicorn main:app'; pkill -f 'vite'; echo 'Services stopped.'"
