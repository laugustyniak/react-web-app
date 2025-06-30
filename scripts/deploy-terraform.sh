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
DOMAIN_MAPPING=false
FORCE_INIT=false
DEBUG=false
IMPORT_EXISTING=false

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
    --no-domain)
      DOMAIN_MAPPING=false
      shift
      ;;
    --force-init)
      FORCE_INIT=true
      shift
      ;;
    --debug)
      DEBUG=true
      shift
      ;;
    --import-existing)
      IMPORT_EXISTING=true
      shift
      ;;
    -h|--help)
      echo "Usage: $0 [OPTIONS]"
      echo "Options:"
      echo "  --env ENV       Environment to deploy (dev|prod) [default: dev]"
      echo "  --no-build      Skip Docker image build"
      echo "  --no-push       Skip Docker image push"
      echo "  --no-domain     Skip domain mapping"
      echo "  --force-init    Force Terraform initialization (useful for backend changes)"
      echo "  --debug         Enable debug mode with verbose output"
      echo "  --import-existing Import existing GCP resources into Terraform state"
      echo "  -h, --help      Show this help message"
      echo ""
      echo "Environment Variables:"
      echo "  TF_VAR_API_KEY  Required API key for the application"
      echo ""
      echo "Examples:"
      echo "  $0                                    # Deploy to dev with all steps"
      echo "  $0 --env prod                         # Deploy to production"
      echo "  $0 --no-build --no-push              # Skip build/push, only deploy"
      echo "  $0 --force-init                      # Force Terraform re-initialization"
      echo "  $0 --import-existing                 # Import existing resources and deploy"
      exit 0
      ;;
    *)
      echo "Unknown option $1"
      exit 1
      ;;
  esac
done

# Enable debug mode if requested
if [[ "$DEBUG" == true ]]; then
  set -x  # Print commands as they are executed
  echo -e "${YELLOW}🐛 Debug mode enabled${NC}"
fi

# Validate environment
if [[ "$ENVIRONMENT" != "dev" && "$ENVIRONMENT" != "prod" ]]; then
  echo -e "${RED}❌ Environment must be 'dev' or 'prod'${NC}"
  exit 1
fi

# Check if API key is set
if [[ -z "$TF_VAR_API_KEY" ]]; then
  echo -e "${RED}❌ TF_VAR_API_KEY environment variable is not set${NC}"
  echo -e "${YELLOW}💡 Set it with: export TF_VAR_API_KEY='your-api-key-here'${NC}"
  exit 1
fi

# Get version from package.json
VERSION=$(jq -r .version package.json)
IMAGE_NAME="us-central1-docker.pkg.dev/insbay-b32351/app-$ENVIRONMENT-repo/app"

echo -e "${BLUE}🚀 Deploying React Web App${NC}"
echo -e "${YELLOW}📦 Version: $VERSION${NC}"
echo -e "${YELLOW}🌍 Environment: $ENVIRONMENT${NC}"
echo ""

# Step 1: Build the application
if [[ "$BUILD_IMAGE" == true ]]; then
  echo -e "${BLUE}📦 Step 1: Building the application...${NC}"
  npm run build

  echo -e "${BLUE}🔨 Step 2: Building Docker image...${NC}"
  docker build -t "$IMAGE_NAME" .
  docker tag "$IMAGE_NAME" "$IMAGE_NAME:$VERSION"
  docker tag "$IMAGE_NAME" "$IMAGE_NAME:latest"
fi

# Step 2: Push to Artifact Registry
if [[ "$PUSH_IMAGE" == true ]]; then
  echo -e "${BLUE}🔑 Step 3: Configuring Docker authentication...${NC}"
  if ! grep -q "us-central1-docker.pkg.dev" ~/.docker/config.json 2>/dev/null; then
    gcloud auth configure-docker us-central1-docker.pkg.dev --quiet
  fi

  echo -e "${BLUE}⬆️ Step 4: Pushing images to Artifact Registry...${NC}"
  docker push "$IMAGE_NAME:$VERSION"
  docker push "$IMAGE_NAME:latest"
fi

# Step 3: Deploy with Terraform
echo -e "${BLUE}🏗️ Step 5: Deploying infrastructure with Terraform...${NC}"
cd terraform/$ENVIRONMENT

# Function to check if Terraform needs initialization
check_terraform_init() {
  if [[ ! -d ".terraform" ]]; then
    return 0  # Needs init
  fi
  
  # Check if backend config has changed by attempting to validate
  if ! terraform validate &>/dev/null; then
    return 0  # Needs init
  fi
  
  # Try a simple plan to see if backend is properly configured
  if ! terraform plan -detailed-exitcode -var-file="${ENVIRONMENT}.tfvars" -var="enable_domain_mapping=${DOMAIN_MAPPING}" &>/dev/null; then
    local exit_code=$?
    if [[ $exit_code -eq 1 ]]; then  # Error (not just changes detected)
      return 0  # Needs init
    fi
  fi
  
  return 1  # No init needed
}

# Initialize Terraform if needed
if [[ "$FORCE_INIT" == true ]] || check_terraform_init; then
  if [[ "$FORCE_INIT" == true ]]; then
    echo -e "${YELLOW}🔧 Force initializing Terraform...${NC}"
  else
    echo -e "${YELLOW}🔧 Initializing Terraform...${NC}"
  fi
  
  # First try with -reconfigure for backend changes
  if ! terraform init -reconfigure -upgrade; then
    echo -e "${YELLOW}⚠️ Reconfigure failed, trying with -migrate-state...${NC}"
    
    # If reconfigure fails, try with migrate-state
    if ! terraform init -migrate-state -upgrade; then
      echo -e "${RED}❌ Terraform initialization failed!${NC}"
      echo -e "${YELLOW}💡 Try manually running: terraform init -reconfigure${NC}"
      echo -e "${YELLOW}💡 Or check if your backend configuration is correct${NC}"
      exit 1
    fi
  fi
  
  echo -e "${GREEN}✅ Terraform initialized successfully${NC}"
else
  echo -e "${GREEN}✅ Terraform already initialized${NC}"
fi

# Validate configuration
echo -e "${YELLOW}🔍 Validating Terraform configuration...${NC}"
if ! terraform validate; then
  echo -e "${RED}❌ Terraform configuration validation failed!${NC}"
  exit 1
fi

# Function to import existing resources
import_existing_resources() {
  echo -e "${YELLOW}🔄 Checking for existing resources that need importing...${NC}"
  
  # Check if Artifact Registry repository exists but not in state
  local repo_name=$(grep -E '^docker_repo_name\s*=' "${ENVIRONMENT}.tfvars" | cut -d'"' -f2)
  local project_id="insbay-b32351"  # From the container image path
  local region="us-central1"        # From the container image path
  
  if [[ -n "$repo_name" ]]; then
    # Check if resource exists in GCP but not in Terraform state
    if ! terraform state show google_artifact_registry_repository.repo &>/dev/null; then
      echo -e "${BLUE}🔍 Checking if Artifact Registry repository '$repo_name' exists...${NC}"
      
      # Check if repo exists in GCP
      if gcloud artifacts repositories describe "$repo_name" --location="$region" --project="$project_id" &>/dev/null; then
        echo -e "${YELLOW}📥 Importing existing Artifact Registry repository...${NC}"
        
        # Import the existing repository
        local import_id="projects/$project_id/locations/$region/repositories/$repo_name"
        if terraform import -var-file="${ENVIRONMENT}.tfvars" google_artifact_registry_repository.repo "$import_id"; then
          echo -e "${GREEN}✅ Successfully imported Artifact Registry repository${NC}"
        else
          echo -e "${RED}❌ Failed to import Artifact Registry repository${NC}"
          echo -e "${YELLOW}💡 You may need to manually import or remove the existing repository${NC}"
          return 1
        fi
      fi
    fi
  fi
  
  return 0
}

# Import existing resources if needed or requested
if [[ "$IMPORT_EXISTING" == true ]]; then
  echo -e "${BLUE}🔄 Force importing existing resources...${NC}"
  if ! import_existing_resources; then
    echo -e "${RED}❌ Resource import failed!${NC}"
    echo -e "${YELLOW}💡 Manual fix: You can either:${NC}"
    echo -e "${YELLOW}   1. Delete the existing repository: gcloud artifacts repositories delete buy-it-dev-repo --location=us-central1${NC}"
    echo -e "${YELLOW}   2. Manually import: terraform import google_artifact_registry_repository.repo projects/insbay-b32351/locations/us-central1/repositories/buy-it-dev-repo${NC}"
    exit 1
  fi
else
  # Auto-import check
  if ! import_existing_resources; then
    echo -e "${RED}❌ Resource import failed!${NC}"
    echo -e "${YELLOW}💡 Manual fix: You can either:${NC}"
    echo -e "${YELLOW}   1. Delete the existing repository: gcloud artifacts repositories delete buy-it-dev-repo --location=us-central1${NC}"
    echo -e "${YELLOW}   2. Manually import: terraform import google_artifact_registry_repository.repo projects/insbay-b32351/locations/us-central1/repositories/buy-it-dev-repo${NC}"
    echo -e "${YELLOW}   3. Try: $0 --import-existing${NC}"
    exit 1
  fi
fi

# Plan and apply
echo -e "${YELLOW}📋 Planning deployment...${NC}"
if ! terraform plan -var-file="${ENVIRONMENT}.tfvars" -var="enable_domain_mapping=${DOMAIN_MAPPING}"; then
  echo -e "${RED}❌ Terraform planning failed!${NC}"
  exit 1
fi

echo -e "${YELLOW}🚀 Applying changes...${NC}"
if ! terraform apply -var-file="${ENVIRONMENT}.tfvars" -var="enable_domain_mapping=${DOMAIN_MAPPING}" -auto-approve; then
  echo -e "${RED}❌ Terraform apply failed!${NC}"
  exit 1
fi

# Get service URL
echo -e "${BLUE}📊 Getting deployment information...${NC}"
if ! SERVICE_URL=$(terraform output -raw service_url 2>/dev/null); then
  echo -e "${YELLOW}⚠️ Could not get service URL from Terraform output${NC}"
  SERVICE_URL="Unknown"
fi

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${GREEN}🌐 Service URL: $SERVICE_URL${NC}"
echo -e "${YELLOW}📊 Version: $VERSION${NC}"
echo -e "${YELLOW}� Image: $IMAGE_NAME:$VERSION${NC}"

# Optional: Open the URL in browser
if command -v open &> /dev/null; then
  echo -e "${BLUE}🌐 Opening service in browser...${NC}"
  open "$SERVICE_URL"
elif command -v xdg-open &> /dev/null; then
  echo -e "${BLUE}🌐 Opening service in browser...${NC}"
  xdg-open "$SERVICE_URL"
fi
