#!/bin/bash

# Environment setup script for Terraform deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 React Web App - Environment Setup${NC}"
echo ""

# Check if API key is set
if [ -n "$TF_VAR_API_KEY" ]; then
    echo -e "${GREEN}✅ API key is already set${NC}"
    echo -e "Key preview: ${TF_VAR_API_KEY:0:8}..."
else
    echo -e "${YELLOW}⚠️  TF_VAR_API_KEY is not set${NC}"
    echo ""
    echo "Please set your API key using one of these methods:"
    echo ""
    echo "1. Export it in your current shell:"
    echo -e "   ${BLUE}export TF_VAR_API_KEY='your-api-key-here'${NC}"
    echo ""
    echo "2. Add it to your shell profile (~/.bashrc or ~/.zshrc):"
    echo -e "   ${BLUE}echo 'export TF_VAR_API_KEY=\"your-api-key-here\"' >> ~/.bashrc${NC}"
    echo ""
    echo "3. Create a .env file (not recommended for production):"
    echo -e "   ${BLUE}echo 'TF_VAR_API_KEY=your-api-key-here' >> .env${NC}"
    echo ""
fi

# Check Google Cloud authentication
echo -e "${BLUE}🔐 Checking Google Cloud authentication...${NC}"
if gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "@"; then
    ACTIVE_ACCOUNT=$(gcloud auth list --filter=status:ACTIVE --format="value(account)")
    echo -e "${GREEN}✅ Authenticated as: $ACTIVE_ACCOUNT${NC}"
else
    echo -e "${RED}❌ Not authenticated with Google Cloud${NC}"
    echo -e "Run: ${BLUE}gcloud auth login${NC}"
    exit 1
fi

# Check project configuration
echo -e "${BLUE}📦 Checking project configuration...${NC}"
PROJECT_ID=$(gcloud config get-value project 2>/dev/null || echo "")
if [ -n "$PROJECT_ID" ]; then
    echo -e "${GREEN}✅ Project ID: $PROJECT_ID${NC}"
else
    echo -e "${YELLOW}⚠️  No default project set${NC}"
    echo -e "Run: ${BLUE}gcloud config set project YOUR_PROJECT_ID${NC}"
fi

# Check Docker authentication
echo -e "${BLUE}🐳 Checking Docker authentication...${NC}"
if grep -q "us-central1-docker.pkg.dev" ~/.docker/config.json 2>/dev/null; then
    echo -e "${GREEN}✅ Docker is configured for Artifact Registry${NC}"
else
    echo -e "${YELLOW}⚠️  Docker not configured for Artifact Registry${NC}"
    echo -e "Run: ${BLUE}gcloud auth configure-docker us-central1-docker.pkg.dev${NC}"
fi

# Check Terraform
echo -e "${BLUE}🏗️  Checking Terraform...${NC}"
if command -v terraform &> /dev/null; then
    TERRAFORM_VERSION=$(terraform version -json | jq -r '.terraform_version')
    echo -e "${GREEN}✅ Terraform installed: v$TERRAFORM_VERSION${NC}"
else
    echo -e "${RED}❌ Terraform not installed${NC}"
    echo -e "Install from: ${BLUE}https://www.terraform.io/downloads${NC}"
    exit 1
fi

# Check if Terraform is initialized
echo -e "${BLUE}🔧 Checking Terraform initialization...${NC}"
if [ -d "terraform/.terraform" ]; then
    echo -e "${GREEN}✅ Terraform is initialized${NC}"
else
    echo -e "${YELLOW}⚠️  Terraform not initialized${NC}"
    echo -e "Run: ${BLUE}npm run infra:init${NC}"
fi

echo ""
echo -e "${GREEN}🚀 Environment check complete!${NC}"

if [ -n "$TF_VAR_API_KEY" ] && [ -n "$PROJECT_ID" ]; then
    echo ""
    echo -e "${BLUE}Ready to deploy:${NC}"
    echo -e "  Development: ${BLUE}npm run deploy:dev${NC}"
    echo -e "  Production:  ${BLUE}npm run deploy${NC}"
fi
