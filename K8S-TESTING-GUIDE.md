# Kubernetes Pod Identification Guide

## Overview
Your Kanban app now displays the pod hostname at the top of the page, making it easy to see which pod is serving each request during load balancing.

## What Was Added

### 1. Pod Identifier Banner (index.html:10-14)
A purple gradient banner at the top showing the pod name that served the request.

### 2. Docker Entrypoint Script (docker-entrypoint.sh)
Injects the actual pod hostname into the HTML at container startup.

### 3. Updated Dockerfile
Now uses the entrypoint script to dynamically set the pod name.

## How It Works

When a pod starts in Kubernetes:
1. The entrypoint script reads the pod's hostname from the `$HOSTNAME` environment variable
2. It replaces the placeholder in index.html with the actual pod name
3. Nginx starts and serves the updated HTML

## Build and Deploy

### Build the Docker Image
```bash
# Build the image
docker build -t your-registry/kanban-app:latest .

# Test locally (hostname will be the container ID)
docker run -p 8083:8083 your-registry/kanban-app:latest

# Push to your registry
docker push your-registry/kanban-app:latest
```

### Deploy to Kubernetes
Deploy using your manual Kubernetes configuration. The pod identification will work automatically - no additional configuration needed!

## Testing Load Balancing

Once deployed with multiple replicas, open the application in your browser and refresh multiple times. You should see the pod name changing in the purple banner at the top, confirming that different pods are handling requests.

**Example pod names you might see:**
```
🚀 Served by Pod: kanban-app-7d8f9c6b5-xk2pm
🚀 Served by Pod: kanban-app-7d8f9c6b5-8fn2k
🚀 Served by Pod: kanban-app-7d8f9c6b5-m9p7q
```

## Useful Commands

### Check running pods
```bash
kubectl get pods
```

### View pod logs
```bash
kubectl logs <pod-name>
```

### Scale your deployment
```bash
kubectl scale deployment <your-deployment-name> --replicas=5
```

## Expected Result
When you access the application, you'll see a purple banner at the top displaying the pod hostname. Each refresh may show a different pod name, confirming Kubernetes load balancing is working correctly.
