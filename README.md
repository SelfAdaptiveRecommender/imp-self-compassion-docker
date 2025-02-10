# Mindful Self-Compassion App

## Quick Start Guide (Using Pre-built Docker Images)

### Prerequisites

- Docker
- Docker Compose

### Installation Steps

1. Create a new directory and navigate into it:

```bash
mkdir mindful-self-compassion-app
cd mindful-self-compassion-app
```

2. Create a docker-compose.yml file:

```yaml
version: "3.8"

services:
  frontend:
    image: davidfhnw/mindful-self-compassion-frontend:latest
    ports:
      - "80:80"
    depends_on:
      - backend

  backend:
    image: davidfhnw/mindful-self-compassion-backend:latest
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
```

3. Pull and start the containers:

```bash
docker-compose pull  # Download the latest images
docker-compose up -d # Start containers in detached mode
```

4. Access the application:
   - Frontend: http://localhost
   - Backend API: http://localhost:8080/api/

### Stopping the Application

```bash
docker-compose down
```

### Updating to Latest Version

```bash
docker-compose pull   # Pull latest images
docker-compose up -d  # Restart containers with new images
```

### Troubleshooting

- If services don't start, check if ports 80 and 8080 are available
- View logs with: `docker-compose logs`
- Ensure you have the latest images: `docker-compose pull`

### Default Credentials

Before Using in Production change credentials at /backend-main/src/main/resources/application.properties

- Admin Username: admin@uned
- Admin Password: uK9#mP2$vL5xN8@

## Secure Deployment with SSL (HTTPS)

### Additional Prerequisites

- Apache web server
- SSL certificate for your domain
- Root access to the server

### Deployment Steps

1. Modify the docker-compose.yml to only accept local connections:

```yaml
ports:
  - "127.0.0.1:80:80" # frontend
  - "127.0.0.1:8080:8080" # backend
```

2. Enable required Apache modules:

```bash
sudo a2enmod ssl proxy proxy_http headers
```

3. Configure Apache virtual host:

- Create SSL virtual host configuration
- Set up proxy rules to forward to:
  - Frontend: http://127.0.0.1:80
  - Backend: http://127.0.0.1:8080/api
- Enable SSL and add your certificates
- Redirect HTTP to HTTPS

4. Start the services:

```bash
docker-compose up -d
sudo systemctl restart apache2
```

Your app will now be accessible via HTTPS on your domain.
