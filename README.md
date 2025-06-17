# Mindful Self-Compassion App - Production Deployment Guide

This guide provides step-by-step instructions for deploying the Mindful Self-Compassion application on a production server, specifically under the path `/self-compassion/`.

## System Requirements

- Ubuntu 24.04.2 LTS 
- Docker v27.5.1
- Docker Compose v2.32.4 installed
- Nginx 1.24.0

## 1. Create Application Directory Structure

```bash
# Create application directory
mkdir -p /home/your-user/mindful-self-compassion-app
cd /home/your-user/mindful-self-compassion-app
```

## 2. Create Environment Configuration File

Create a `.env` file in the application directory:

```bash
# Create and edit .env file
nano .env
```

Adapt the following content, and replace `your-doman.com`

```
# Frontend Configuration
VUE_APP_PUBLIC_PATH=/self-compassion/

# Backend Configuration
PORT=8080
CORS_ALLOWED_ORIGINS=http://your-domain.com
CORS_ALLOWED_METHODS=GET,POST,PUT,DELETE,OPTIONS,HEAD
CORS_ALLOWED_HEADERS=Authorization,Content-Type,Accept,Origin,Access-Control-Request-Method,Access-Control-Request-Headers
CORS_ALLOW_CREDENTIALS=true
CORS_MAX_AGE=3600
NODE_ENV=production
```

## 3. Create Docker Compose Configuration

Create a `docker-compose.yml` file in the application directory:

```bash
# Create and edit docker-compose.yml
nano docker-compose.yml
```

Add the following content:

```yaml
# Docker compose file for Mindful Self-Compassion application
# Note: This requires Nginx configuration on the host system
# The application will be accessible via:
# - Frontend: http://your-domain.com/self-compassion/
# - Backend API: http://your-domain.com/self-compassion/api/

version: '3.8'

services:
  frontend:
    image: davidfhnw/mindful-self-compassion-frontend:latest
    ports:
      - "127.0.0.1:8081:80"  # Only accessible from localhost on port 8081
    env_file:
      - .env
    environment:
      - VUE_APP_PUBLIC_PATH=${VUE_APP_PUBLIC_PATH}
    depends_on:
      - backend
    restart: unless-stopped

  backend:
    image: davidfhnw/mindful-self-compassion-backend:latest
    ports:
      - "127.0.0.1:8080:8080"  # Only accessible from localhost
    env_file:
      - .env
    environment:
      - PORT=8080
      - CORS_ALLOWED_ORIGINS=${CORS_ALLOWED_ORIGINS}
      - CORS_ALLOWED_METHODS=${CORS_ALLOWED_METHODS}
      - CORS_ALLOWED_HEADERS=${CORS_ALLOWED_HEADERS}
      - CORS_ALLOW_CREDENTIALS=${CORS_ALLOW_CREDENTIALS}
      - CORS_MAX_AGE=${CORS_MAX_AGE}
      - NODE_ENV=production
    restart: unless-stopped
```

## 4. Configure Nginx

Create a Nginx configuration file:

```bash
# Create and edit the Nginx configuration
sudo nano /etc/nginx/sites-available/mindful-self-compassion.conf
```

Add the following content, update `your-domain.com` 

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Backend API proxy
    location /self-compassion/api/ {
        proxy_pass http://127.0.0.1:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # CORS for API
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' 'http://your-domain.com';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type, Accept, Origin';
            add_header 'Access-Control-Allow-Credentials' 'true';
            add_header 'Content-Length' 0;
            add_header 'Content-Type' 'text/plain';
            return 200;
        }
        add_header 'Access-Control-Allow-Origin' 'http://your-domain.com';
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
        add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type, Accept, Origin';
        add_header 'Access-Control-Allow-Credentials' 'true';
    }

    # Frontend proxy - IMPORTANT: this will proxy all requests
    location /self-compassion/ {
        proxy_pass http://127.0.0.1:8081/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN";
        add_header X-XSS-Protection "1; mode=block";
        add_header X-Content-Type-Options "nosniff";
    }

    # Logging
    access_log /var/log/nginx/mindful-self-compassion-access.log;
    error_log /var/log/nginx/mindful-self-compassion-error.log;
}
```
Enable the configuration and test it:

```bash
# Create a symbolic link to enable the site
sudo ln -sf /etc/nginx/sites-available/mindful-self-compassion.conf /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# If the test is successful, restart Nginx
sudo systemctl restart nginx
```

## 5. Pull Docker Images and Start Containers

```bash
# Pull the Docker images
cd /home/your-user/mindful-self-compassion-app
sudo docker compose pull

# Start the containers
sudo docker compose up -d
```

## 6. Verify Deployment

Your application should now be accessible at:
- Frontend: http://your-domain.com/self-compassion/
- API: http://your-domain.com/self-compassion/api/

## 7. Application Management

### Starting the Application
```bash
cd /home/your-user/mindful-self-compassion-app
docker compose up -d
```

### Stopping the Application
```bash
cd /home/your-user/mindful-self-compassion-app
docker compose down
```

### Updating the Application
```bash
cd /home/your-user/mindful-self-compassion-app
docker compose down
docker compose pull
docker compose up -d
```

### Viewing Logs
```bash
# View all logs
docker compose logs

# View logs for a specific service
docker compose logs frontend
docker compose logs backend

# Follow logs in real-time
docker compose logs -f
```

## 8. Additional Security (highly recommended)

### Enable HTTPS

1. Install Certbot:
```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
```

2. Obtain and install SSL certificates:
```bash
sudo certbot --nginx -d your-domain.com
```

3. Follow the prompts to complete the setup.

## 9. Troubleshooting

### Frontend 404 Errors
If you're getting 404 errors for CSS/JS files:

1. Clear your browser cache
2. Check Nginx logs: `sudo tail -f /var/log/nginx/mindful-self-compassion-error.log`
3. Ensure the Docker container is running: `docker compose ps`

### API Connection Issues
If the frontend can't connect to the API:

1. Verify the API is running: `curl -I http://localhost:8080/api/health`
2. Check CORS configuration in the .env file
3. Verify Nginx proxy configuration for the API path

### Container Issues
If containers won't start or keep crashing:

1. Check Docker logs: `docker compose logs`
2. Verify environment variables: `docker compose config`
3. Check if ports are already in use: `sudo netstat -tulpn | grep -E '8080|8081'`

## 10. Building and Publishing Docker Images

If you need to build your own Docker images and publish them to Docker Hub, follow these steps:

### Prerequisites
- Docker installed on your development machine
- Docker Hub account (create one at https://hub.docker.com if needed)
- Logged in to Docker Hub via CLI (`docker login`)

### Building and Publishing Frontend Image

1. Navigate to the frontend directory:
```bash
cd /path/to/frontend-main
```

2. Make sure the Vue configuration is set up for the `/self-compassion/` path:
```javascript
// In vue.config.js
module.exports = defineConfig({
  publicPath: '/self-compassion/',
  // other config...
});
```

3. Build the Docker image:
```bash
# Build with a version tag
docker build -t mindful-self-compassion-frontend:1.0.0 .
```

4. Tag the image for Docker Hub (replace 'yourusername' with your Docker Hub username):
```bash
docker tag mindful-self-compassion-frontend:1.0.0 yourusername/mindful-self-compassion-frontend:1.0.0
docker tag mindful-self-compassion-frontend:1.0.0 yourusername/mindful-self-compassion-frontend:latest
```

5. Push the image to Docker Hub:
```bash
docker push yourusername/mindful-self-compassion-frontend:1.0.0
docker push yourusername/mindful-self-compassion-frontend:latest
```

### Building and Publishing Backend Image

1. Navigate to the backend directory:
```bash
cd /path/to/backend-main
```

2. Build the Docker image:
```bash
# Build with a version tag
docker build -t mindful-self-compassion-backend:1.0.0 .
```

3. Tag the image for Docker Hub (replace 'yourusername' with your Docker Hub username):
```bash
docker tag mindful-self-compassion-backend:1.0.0 yourusername/mindful-self-compassion-backend:1.0.0
docker tag mindful-self-compassion-backend:1.0.0 yourusername/mindful-self-compassion-backend:latest
```

4. Push the image to Docker Hub:
```bash
docker push yourusername/mindful-self-compassion-backend:1.0.0
docker push yourusername/mindful-self-compassion-backend:latest
```

### Using Your Custom Images

After publishing your images to Docker Hub, update your `docker-compose.yml` file to use your images:

```yaml
services:
  frontend:
    image: yourusername/mindful-self-compassion-frontend:latest
    # rest of configuration...
    
  backend:
    image: yourusername/mindful-self-compassion-backend:latest
    # rest of configuration...
```

## Admin Credentials
(Send separately for security)

## Important Note
This guide assumes you're using Docker Compose v2. If you're using an older version, you may need to use `docker-compose` (with a hyphen) instead of `docker compose` in the commands. 

