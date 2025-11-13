# Kanban Board Application

A lightweight, containerized Kanban board application designed for Docker and Kubernetes deployment. Features pod identification for visualizing load balancing in Kubernetes environments.

## Features

- **Kanban Board**: Organize tasks across three columns (To Do, In Progress, Done)
- **Task Management**: Create, edit, and move tasks between columns
- **Rich Task Details**:
  - Descriptions
  - Checklists
  - Image uploads
  - Comments
- **Pod Identification**: Visual indicator showing which Kubernetes pod served the request
- **Persistent Storage**: Tasks stored in browser's local storage
- **Responsive Design**: Works on desktop and mobile devices

## Technologies

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Web Server**: Nginx Alpine (lightweight container)
- **Container**: Docker
- **Orchestration**: Kubernetes-ready with pod identification

## Prerequisites

- Docker installed on your machine
- (Optional) Kubernetes cluster for orchestration
- (Optional) Docker registry for image storage

## Quick Start

### Run with Docker

1. Build the Docker image:
```bash
docker build -t kanban-app:latest .
```

2. Run the container:
```bash
docker run -p 8083:8083 kanban-app:latest
```

3. Access the application:
```
http://localhost:8083
```

### Deploy to Kubernetes

1. Build and push to your registry:
```bash
docker build -t your-registry/kanban-app:latest .
docker push your-registry/kanban-app:latest
```

2. Create a deployment with multiple replicas:
```bash
kubectl create deployment kanban-app --image=your-registry/kanban-app:latest --replicas=3
```

3. Expose the deployment:
```bash
kubectl expose deployment kanban-app --type=LoadBalancer --port=8083
```

4. Get the service URL:
```bash
kubectl get service kanban-app
```

For detailed Kubernetes testing instructions, see [K8S-TESTING-GUIDE.md](K8S-TESTING-GUIDE.md).

## Project Structure

```
.
├── index.html              # Main HTML file with Kanban board structure
├── style.css               # Styling for the Kanban board
├── script.js               # JavaScript logic for task management
├── nginx.conf              # Nginx configuration (port 8083)
├── Dockerfile              # Multi-stage Docker build configuration
├── docker-entrypoint.sh    # Entrypoint script for pod identification
├── .dockerignore           # Files to exclude from Docker build
└── K8S-TESTING-GUIDE.md    # Kubernetes deployment guide
```

## How It Works

### Pod Identification
The application includes a unique feature for Kubernetes environments:

1. **Entrypoint Script**: On container startup, `docker-entrypoint.sh` reads the pod's hostname from the `$HOSTNAME` environment variable
2. **Dynamic Injection**: The script replaces a placeholder in `index.html` with the actual pod name
3. **Visual Indicator**: A purple banner at the top displays which pod served the request
4. **Load Balancing Visualization**: Refreshing the page shows different pod names, confirming proper load distribution

### Task Storage
Tasks are stored in the browser's `localStorage`, meaning:
- Data persists across page refreshes
- Data is local to each browser/device
- No backend database required

## Development

### Local Development (without Docker)

1. Simply open `index.html` in a web browser
2. Or use a simple HTTP server:
```bash
# Python 3
python -m http.server 8083

# Node.js (with http-server)
npx http-server -p 8083
```

### Modifying the Application

- **UI Changes**: Edit `index.html` and `style.css`
- **Functionality**: Modify `script.js`
- **Server Config**: Update `nginx.conf`
- **Port Changes**: Update port in `nginx.conf`, `Dockerfile` EXPOSE directive, and deployment configurations

## Testing Load Balancing

Once deployed to Kubernetes with multiple replicas:

1. Access the application through the service URL
2. Refresh the page multiple times
3. Observe the pod name changing in the purple banner
4. Each different name confirms a different pod handled the request

Example pod names:
```
🚀 Served by Pod: kanban-app-7d8f9c6b5-xk2pm
🚀 Served by Pod: kanban-app-7d8f9c6b5-8fn2k
🚀 Served by Pod: kanban-app-7d8f9c6b5-m9p7q
```

## Useful Commands

### Docker

```bash
# Build image
docker build -t kanban-app:latest .

# Run container
docker run -p 8083:8083 kanban-app:latest

# View running containers
docker ps

# View logs
docker logs <container-id>

# Stop container
docker stop <container-id>
```

### Kubernetes

```bash
# View pods
kubectl get pods

# View services
kubectl get services

# Scale deployment
kubectl scale deployment kanban-app --replicas=5

# View pod logs
kubectl logs <pod-name>

# Describe pod
kubectl describe pod <pod-name>

# Delete deployment
kubectl delete deployment kanban-app
```

## Configuration

### Port Configuration
Default port is `8083`. To change:
1. Update `nginx.conf` (line 2)
2. Update `Dockerfile` EXPOSE directive (line 23)
3. Update your Kubernetes service configuration

### Nginx Caching
Static assets (CSS, JS, images) are cached for 1 year. Modify `nginx.conf` to adjust caching behavior.

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

Note: Requires JavaScript enabled and localStorage support.

## License

This project is available for educational and learning purposes.

## Contributing

This is a learning project for Docker and Kubernetes. Feel free to fork and experiment!
