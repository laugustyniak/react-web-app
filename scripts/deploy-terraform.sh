#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="dev"
BUILD_IMAGE=true
PUSH_IMAGE=true

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --env)
      ENVIRONMENT="$2"
      shift 2
      ;;
    --no-build)
      BUILD_IMAGE=false
      shift
      ;;
    --no-push)
      PUSH_IMAGE=false
      shift
      ;;
    -h|--help)
      echo "Usage: $0 [OPTIONS]"
      echo "Options:"
      echo "  --env ENV       Environment to deploy (dev|prod) [default: dev]"
      echo "  --no-build      Skip Docker image build"
      echo "  --no-push       Skip Docker image push"
      echo "  -h, --help      Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option $1"
      exit 1
      ;;
  esac
done

# Validate environment
if [[ "$ENVIRONMENT" != "dev" && "$ENVIRONMENT" != "prod" ]]; then
  echo -e "${RED}❌ Environment must be 'dev' or 'prod'${NC}"
  exit 1
fi

# Check if API key is set
if [[ -z "$TF_VAR_api_key" ]]; then
  echo -e "${RED}❌ TF_VAR_api_key environment variable is not set${NC}"
  echo -e "${YELLOW}💡 Set it with: export TF_VAR_api_key='your-api-key-here'${NC}"
  exit 1
fi

# Get version from package.json
VERSION=$(jq -r .version package.json)
IMAGE_NAME="us-central1-docker.pkg.dev/insbay-b32351/buy-it-docker-repo/buy-it"

echo -e "${BLUE}🚀 Deploying React Web App${NC}"
echo -e "${YELLOW}📦 Version: $VERSION${NC}"
echo -e "${YELLOW}🌍 Environment: $ENVIRONMENT${NC}"
echo ""

# Step 1: Build the application
if [[ "$BUILD_IMAGE" == true ]]; then
  echo -e "${BLUE}📦 Step 1: Building the application...${NC}"
  npm run build

  echo -e "${BLUE}🔨 Step 2: Building Docker image...${NC}"
  docker build -t "$IMAGE_NAME:$ENVIRONMENT-$VERSION" .
  docker tag "$IMAGE_NAME:$ENVIRONMENT-$VERSION" "$IMAGE_NAME:$ENVIRONMENT"
fi

# Step 2: Push to Artifact Registry
if [[ "$PUSH_IMAGE" == true ]]; then
  echo -e "${BLUE}🔑 Step 3: Configuring Docker authentication...${NC}"
  if ! grep -q "us-central1-docker.pkg.dev" ~/.docker/config.json 2>/dev/null; then
    gcloud auth configure-docker us-central1-docker.pkg.dev --quiet
  fi

  echo -e "${BLUE}⬆️ Step 4: Pushing images to Artifact Registry...${NC}"
  docker push "$IMAGE_NAME:$ENVIRONMENT"
  docker push "$IMAGE_NAME:$ENVIRONMENT-$VERSION"
fi

# Step 3: Deploy with Terraform
echo -e "${BLUE}🏗️ Step 5: Deploying infrastructure with Terraform...${NC}"
cd terraform

# Initialize Terraform if needed
if [[ ! -d ".terraform" ]]; then
  echo -e "${YELLOW}🔧 Initializing Terraform...${NC}"
  terraform init
fi

# Plan and apply
echo -e "${YELLOW}📋 Planning deployment...${NC}"
terraform plan -var-file="${ENVIRONMENT}.tfvars"

echo -e "${YELLOW}🚀 Applying changes...${NC}"
terraform apply -var-file="${ENVIRONMENT}.tfvars" -auto-approve

# Get service URL
SERVICE_URL=$(terraform output -raw service_url)

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${GREEN}🌐 Service URL: $SERVICE_URL${NC}"
echo -e "${YELLOW}📊 Version: $VERSION${NC}"
echo -e "${YELLOW}🔧 Environment: $ENVIRONMENT${NC}"
echo -e "${YELLOW}📦 Image: $IMAGE_NAME:$ENVIRONMENT-$VERSION${NC}"

# Optional: Open the URL in browser
if command -v open &> /dev/null; then
  echo -e "${BLUE}🌐 Opening service in browser...${NC}"
  open "$SERVICE_URL"
elif command -v xdg-open &> /dev/null; then
  echo -e "${BLUE}🌐 Opening service in browser...${NC}"
  xdg-open "$SERVICE_URL"
fi
