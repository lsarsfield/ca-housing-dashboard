#!/bin/bash
# Start the development server with Node 20 (required for Next.js 16)
# Usage: ./dev.sh

NODE20="/tmp/node20/bin/node"
NPM20="/tmp/node20/lib/node_modules/npm/bin/npm-cli.js"

if [ ! -f "$NODE20" ]; then
  echo "Node 20 not found at $NODE20"
  echo "Downloading Node 20..."
  NODE_VERSION="20.11.1"
  curl -L "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-darwin-x64.tar.gz" -o /tmp/node.tar.gz
  mkdir -p /tmp/node20
  tar -xzf /tmp/node.tar.gz -C /tmp/node20 --strip-components=1
fi

echo "Using: $($NODE20 --version)"
export PATH="/tmp/mybin:/tmp/node20/bin:/bin:/usr/bin:/usr/sbin:/sbin:$PATH"

# Create shim dir for subprocess node resolution
mkdir -p /tmp/mybin
ln -sf /tmp/node20/bin/node /tmp/mybin/node
ln -sf /tmp/node20/bin/npm /tmp/mybin/npm

"$NODE20" "$NPM20" run dev
