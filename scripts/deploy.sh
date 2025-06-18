#!/bin/bash

# Deploy Render Service to Cloud Run
# Usage: ./scripts/deploy.sh [version]

set -e

# Configuration
PROJECT_ID="canvascraft-us3rv"
SERVICE_NAME="canvasmatic-render-service"
REGION="us-central1"
VERSION=${1:-$(date +%Y%m%d-%H%M%S)}

echo "🚀 Deploying Canvasmatic Render Service..."
echo "📋 Configuration:"
echo "   Project ID: $PROJECT_ID"
echo "   Service Name: $SERVICE_NAME"
echo "   Region: $REGION"
echo "   Version: $VERSION"

# Build Docker image
echo "🔨 Building Docker image..."
docker build -t gcr.io/$PROJECT_ID/$SERVICE_NAME:$VERSION .
docker tag gcr.io/$PROJECT_ID/$SERVICE_NAME:$VERSION gcr.io/$PROJECT_ID/$SERVICE_NAME:latest

# Push to Container Registry
echo "📤 Pushing to Container Registry..."
docker push gcr.io/$PROJECT_ID/$SERVICE_NAME:$VERSION
docker push gcr.io/$PROJECT_ID/$SERVICE_NAME:latest

# Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME:$VERSION \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars FIREBASE_PROJECT_ID="$PROJECT_ID" \
  --set-env-vars FIREBASE_CLIENT_EMAIL="firebase-adminsdk-fbsvc@$PROJECT_ID.iam.gserviceaccount.com" \
  --set-env-vars NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="$PROJECT_ID.appspot.com" \
  --set-secrets=FIREBASE_PRIVATE_KEY=RENDER_SERVICE_FIREBASE_ADMIN_PRIVATE_KEY:latest \
  --memory 2Gi \
  --cpu 2 \
  --max-instances 10 \
  --timeout 300

# Get service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --format 'value(status.url)')

echo "✅ Deployment completed successfully!"
echo "🌐 Service URL: $SERVICE_URL"
echo "🔗 Health check: $SERVICE_URL/health"
echo "🎨 Render endpoint: $SERVICE_URL/render"
echo "📊 Cloud Run Console: https://console.cloud.google.com/run/detail/$REGION/$SERVICE_NAME" 