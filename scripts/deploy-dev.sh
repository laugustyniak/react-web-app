#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="insbay-b32351"
REGION="us-central1"
SERVICE_NAME="react-web-app-dev"
IMAGE_NAME="us-central1-docker.pkg.dev/$PROJECT_ID/buy-it-dev/$SERVICE_NAME"

# Get the current version from package.json and add dev suffix
VERSION=$(jq -r .version package.json)
DEV_VERSION="$VERSION-dev-$(date +%Y%m%d-%H%M%S)"

echo -e "${BLUE}🚀 Starting DEV deployment for react-web-app${NC}"
echo -e "${YELLOW}Version: $DEV_VERSION${NC}"
echo -e "${YELLOW}Service: $SERVICE_NAME${NC}"

# Step 1: Build the application
echo -e "\n${BLUE}📦 Step 1: Building the application...${NC}"
npm run build

# Step 2: Build Docker image (using production Dockerfile)
echo -e "\n${BLUE}🔨 Step 2: Building Docker image...${NC}"
docker build -t "$IMAGE_NAME:$DEV_VERSION" .

# Also tag as dev-latest
echo -e "${YELLOW}🏷️ Tagging as dev-latest...${NC}"
docker tag "$IMAGE_NAME:$DEV_VERSION" "$IMAGE_NAME:dev-latest"

# Step 3: Configure Docker authentication if needed
echo -e "\n${BLUE}🔑 Step 3: Configuring Docker authentication...${NC}"
if ! grep -q "us-central1-docker.pkg.dev" ~/.docker/config.json 2>/dev/null; then
  echo "Configuring Docker authentication for GCP Artifact Registry..."
  gcloud auth configure-docker us-central1-docker.pkg.dev --quiet
else
  echo "Docker authentication already configured."
fi

# Step 4: Push images to Artifact Registry
echo -e "\n${BLUE}⬆️ Step 4: Pushing images to Artifact Registry...${NC}"
docker push "$IMAGE_NAME:$DEV_VERSION"
docker push "$IMAGE_NAME:dev-latest"

# Step 5: Deploy to Cloud Run (same settings as production)
echo -e "\n${BLUE}🚀 Step 5: Deploying to Cloud Run (DEV)...${NC}"
gcloud run deploy $SERVICE_NAME \
  --image="$IMAGE_NAME:$DEV_VERSION" \
  --region="$REGION" \
  --platform=managed \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production" \
  --memory=512Mi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=10

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")

echo -e "\n${GREEN}✅ DEV Deployment complete!${NC}"
echo -e "${GREEN}🌐 Service URL: $SERVICE_URL${NC}"
echo -e "${YELLOW}📊 Version: $DEV_VERSION${NC}"
echo -e "${YELLOW}🔧 Environment: production (same as prod)${NC}"

# Optional: Open the URL in browser (uncomment if desired)
# echo -e "\n${BLUE}🌐 Opening service in browser...${NC}"
# open "$SERVICE_URL" 2>/dev/null || xdg-open "$SERVICE_URL" 2>/dev/null || echo "Please open $SERVICE_URL in your browser"

echo -e "\n${BLUE}📋 Useful commands:${NC}"
echo -e "  View logs: ${YELLOW}gcloud run services logs read $SERVICE_NAME --region=$REGION${NC}"
echo -e "  Delete service: ${YELLOW}gcloud run services delete $SERVICE_NAME --region=$REGION${NC}"
echo -e "  Update service: ${YELLOW}npm run deploy:dev${NC}"
