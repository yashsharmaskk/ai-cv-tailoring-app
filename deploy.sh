#!/bin/bash
echo "🐳 Building and deploying CV Tailoring Application with Docker..."

echo ""
echo "📦 Building Docker image..."
docker build -t cv-tailoring-app .

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed!"
    exit 1
fi

echo ""
echo "🚀 Starting application with Docker Compose..."
docker-compose up -d

if [ $? -ne 0 ]; then
    echo "❌ Docker Compose failed!"
    exit 1
fi

echo ""
echo "✅ Application deployed successfully!"
echo "🌐 Access your app at: http://localhost"
echo "📊 Direct app access: http://localhost:5000"
echo "🔍 Health check: http://localhost:5000/health"

echo ""
echo "📋 Useful commands:"
echo "  - View logs: docker-compose logs -f"
echo "  - Stop app: docker-compose down"
echo "  - Restart: docker-compose restart"
echo "  - View containers: docker ps"
