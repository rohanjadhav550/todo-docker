#!/bin/sh

# Get the hostname (pod name in Kubernetes)
POD_NAME=${HOSTNAME:-"unknown-pod"}

# Replace the placeholder in index.html with the actual pod name
sed -i "s/POD_HOSTNAME_PLACEHOLDER/$POD_NAME/g" /usr/share/nginx/html/index.html

echo "Pod name set to: $POD_NAME"

# Start nginx
exec nginx -g "daemon off;"
