# Docker Deployment Guide

## 🐳 CV Tailoring Application - Docker Setup

This guide will help you deploy your CV Tailoring Application using Docker for production use.

## Prerequisites

1. **Docker Desktop** installed and running
   - Download from: https://www.docker.com/products/docker-desktop/
   - Make sure Docker Desktop is started

2. **Environment Configuration**
   - Copy `.env.production` to `.env`
   - Add your actual Gemini API keys

## Quick Start

### Option 1: Simple Deployment (Recommended for beginners)
```bash
# Windows
deploy.bat

# Linux/Mac
chmod +x deploy.sh
./deploy.sh
```

### Option 2: Manual Docker Commands

```bash
# Build the Docker image
docker build -t cv-tailoring-app .

# Run with simple compose (no nginx)
docker-compose -f docker-compose.simple.yml up -d

# Or run with full setup (includes nginx proxy)
docker-compose up -d
```

## Configuration Files

### 🔧 Environment Variables (.env)
```env
NODE_ENV=production
PORT=5000
GEMINI_API_KEY_1=your-actual-api-key-here
GEMINI_API_KEY_2=your-backup-key-here
```

### 📁 Docker Files Overview

| File | Purpose |
|------|---------|
| `Dockerfile` | Main container configuration |
| `docker-compose.yml` | Full setup with nginx proxy |
| `docker-compose.simple.yml` | Simple setup, app only |
| `.dockerignore` | Files to exclude from build |
| `nginx.conf` | Reverse proxy configuration |

## Access Your Application

- **Simple Setup**: http://localhost:5000
- **With Nginx**: http://localhost (port 80)
- **Health Check**: http://localhost:5000/health

## Management Commands

### 📊 Monitor Application
```bash
# View logs
docker-compose logs -f

# Check container status
docker ps

# Check health
curl http://localhost:5000/health
```

### 🔄 Updates and Maintenance
```bash
# Restart application
docker-compose restart

# Stop application
docker-compose down

# Update and rebuild
docker-compose down
docker build -t cv-tailoring-app .
docker-compose up -d
```

### 🧹 Cleanup
```bash
# Stop and remove containers
docker-compose down

# Remove unused images and volumes
docker system prune -f

# Windows cleanup script
stop.bat
```

## Production Features

### 🔒 Security
- Non-root user execution
- Security headers via nginx
- Rate limiting on API endpoints
- File upload size limits

### 📈 Monitoring
- Health check endpoint: `/health`
- Container health monitoring
- Automatic restart on failure
- Resource usage tracking

### 🚀 Performance
- Multi-stage Docker builds
- Optimized dependencies
- nginx reverse proxy
- Static file serving

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Stop local server first
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   ```

2. **Docker Build Fails**
   ```bash
   # Make sure Docker Desktop is running
   docker --version
   docker ps
   ```

3. **Environment Variables Not Loading**
   ```bash
   # Check .env file exists and has correct format
   type .env
   ```

4. **API Keys Not Working**
   ```bash
   # Check logs for API key issues
   docker-compose logs cv-tailoring-app
   ```

### Health Check
The application includes a health check endpoint that reports:
- Application status
- Memory usage
- Uptime
- Node.js version

Access at: `http://localhost:5000/health`

## Development vs Production

| Feature | Development | Production (Docker) |
|---------|-------------|---------------------|
| Node.js | Local install | Containerized |
| Process Management | npm scripts | Docker + dumb-init |
| Reverse Proxy | None | nginx (optional) |
| Security | Basic | Enhanced headers, rate limiting |
| Monitoring | Console logs | Health checks, container monitoring |
| Scalability | Single instance | Container orchestration ready |

## Next Steps

1. **Cloud Deployment**: Use docker-compose.yml on cloud platforms
2. **Load Balancing**: Scale with multiple container instances
3. **SSL/HTTPS**: Add certificates to nginx configuration
4. **Database**: Add persistent storage for user data
5. **CI/CD**: Automate builds and deployments

## Support

If you encounter issues:
1. Check Docker Desktop is running
2. Verify `.env` file has valid API keys
3. Check logs: `docker-compose logs -f`
4. Try simple deployment first: `docker-compose -f docker-compose.simple.yml up -d`
