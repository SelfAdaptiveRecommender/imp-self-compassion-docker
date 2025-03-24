# Mindful Self-Compassion App - Production Configuration
### 1. Create Direcotry
```bash
mkdir mindful-self-compassion-app
cd mindful-self-compassion-app
```


### 1. Production Environment File (.env)

```bash
# Create env file in mindful-self-compassion-app directory
nano .env
```

```bash
# Frontend Configuration
VUE_APP_BACKEND_URL=http://your-domain.com/api

# Backend Configuration
SPRING_PROFILES_ACTIVE=prod
CORS_ALLOWED_ORIGINS=http://your-domain.com
CORS_ALLOWED_METHODS=GET,POST,PUT,DELETE,OPTIONS,HEAD
CORS_ALLOWED_HEADERS=Authorization,Content-Type,Accept,Origin,Access-Control-Request-Method,Access-Control-Request-Headers
CORS_ALLOW_CREDENTIALS=true
CORS_MAX_AGE=3600
```

### 2. Docker Compose Configuration 
Create file docker-compose.yml in mindful-self-compasstion-app directory
```yaml
services:
  frontend:
    image: davidfhnw/mindful-self-compassion-frontend:latest
    ports:
      - "127.0.0.1:8081:80"  # Only accessible from localhost on port 8081
    env_file:
      - .env
    environment:
      - VUE_APP_BACKEND_URL=${VUE_APP_BACKEND_URL}
    depends_on:
      - backend

  backend:
    image: davidfhnw/mindful-self-compassion-backend:latest
    ports:
      - "127.0.0.1:8080:8080"  # Only accessible from localhost
    env_file:
      - .env
    environment:
      - SPRING_PROFILES_ACTIVE=${SPRING_PROFILES_ACTIVE}
      - CORS_ALLOWED_ORIGINS=${CORS_ALLOWED_ORIGINS}
      - CORS_ALLOWED_METHODS=${CORS_ALLOWED_METHODS}
      - CORS_ALLOWED_HEADERS=${CORS_ALLOWED_HEADERS}
      - CORS_ALLOW_CREDENTIALS=${CORS_ALLOW_CREDENTIALS}
      - CORS_MAX_AGE=${CORS_MAX_AGE}
```

### 3. Apache Virtual Host Configuration 

Create new Config file at /etc/apache2/sites-available/mindful-self-compassion.conf

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    ServerAdmin webmaster@your-domain.com
    
    # Enable required modules
    LoadModule proxy_module /usr/lib/apache2/modules/mod_proxy.so
    LoadModule proxy_http_module /usr/lib/apache2/modules/mod_proxy_http.so
    LoadModule headers_module /usr/lib/apache2/modules/mod_headers.so
    LoadModule rewrite_module /usr/lib/apache2/modules/mod_rewrite.so
    
    # Backend API proxy - make sure this comes BEFORE the frontend proxy
    ProxyPass /api/ http://127.0.0.1:8080/api/
    ProxyPassReverse /api/ http://127.0.0.1:8080/api/
    
    # Frontend proxy
    ProxyPreserveHost On
    ProxyPass / http://127.0.0.1:8081/
    ProxyPassReverse / http://127.0.0.1:8081/
    
    # WebSocket support
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} websocket [NC]
    RewriteCond %{HTTP:Connection} upgrade [NC]
    RewriteRule ^/?(.*) "ws://127.0.0.1:8081/$1" [P,L]
    
    # Basic security headers
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set X-Content-Type-Options "nosniff"
    
    # Enable CORS
    Header always set Access-Control-Allow-Origin "http://your-domain.com"
    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header always set Access-Control-Allow-Headers "Authorization, Content-Type, Accept, Origin"
    Header always set Access-Control-Allow-Credentials "true"
    
    # Handle OPTIONS method
    RewriteCond %{REQUEST_METHOD} OPTIONS
    RewriteRule ^(.*)$ $1 [R=200,L]
</VirtualHost>
```

After creating the configuration file, enable it and restart Apache:
```bash
# Enable the site
sudo a2ensite mindful-self-compassion.conf

# Enable required Apache modules
sudo a2enmod proxy proxy_http headers rewrite

# Restart Apache to apply changes
sudo systemctl restart apache2
```

## Important Notes

1. Replace `your-domain.com` with your actual domain name in all configuration files
2. This setup uses HTTP only - all traffic will be unencrypted
3. The backend API will be accessible at `http://your-domain.com/api`
4. The frontend will be accessible at `http://your-domain.com` (proxied through Apache to port 8081)
5. If using a firewall, ensure ports 80 (for Apache) and 8081 (for frontend) are open

## Admin Credentials  
(send separately by mail)


## Updating the Application

To update to the latest version:
```bash
docker compose pull   # Pull latest images
docker compose --env-file .env up -d  # Restart containers with new images
```

## Troubleshooting

- If services don't start, check if ports 80 and 8080 are available
- View logs with: `docker compose logs`
- Check Apache error logs: `sudo tail -f /var/log/apache2/error.log`
- Ensure you have the latest images: `docker compose pull`
