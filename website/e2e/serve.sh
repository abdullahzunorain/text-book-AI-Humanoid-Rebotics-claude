#!/bin/sh
set -e
SERVE_DIR="/tmp/pw-serve/text-book-AI-Humanoid-Rebotics-CLAUDE"
mkdir -p "$SERVE_DIR"
cp -r build/* "$SERVE_DIR/"
exec npx serve /tmp/pw-serve -l 3000 --no-clipboard
