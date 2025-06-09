#!/bin/bash

# Terraform wrapper script that loads environment variables from .env file

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_ROOT/.env"
TERRAFORM_DIR="$PROJECT_ROOT/terraform"

echo -e "${BLUE}🚀 Terraform with Environment Variables${NC}"
echo ""

# Check if .env file exists
if [ -f "$ENV_FILE" ]; then
    echo -e "${GREEN}✅ Loading environment variables from .env${NC}"

    # Export variables from .env file
    # This handles variables in the format: VARIABLE_NAME=value
    set -a  # automatically export all variables
    source "$ENV_FILE"
    set +a  # stop automatically exporting

    # Convert INSBUY_API_KEY_1 to TF_VAR_api_key if it exists
    if [ -n "$INSBUY_API_KEY_1" ] && [ -z "$TF_VAR_api_key" ]; then
        export TF_VAR_api_key="$INSBUY_API_KEY_1"
        echo -e "${BLUE}📝 Using INSBUY_API_KEY_1 as TF_VAR_api_key${NC}"
    fi

else
    echo -e "${YELLOW}⚠️  .env file not found at: $ENV_FILE${NC}"
    echo "Please create a .env file or set TF_VAR_api_key manually"
fi

# Check if API key is now available
if [ -n "$TF_VAR_api_key" ]; then
    echo -e "${GREEN}✅ API key loaded successfully${NC}"
    echo -e "Key preview: ${TF_VAR_api_key:0:8}..."
else
    echo -e "${RED}❌ No API key found${NC}"
    echo "Please set TF_VAR_api_key or add INSBUY_API_KEY_1 to your .env file"
    exit 1
fi

echo ""

# Change to terraform directory
cd "$TERRAFORM_DIR"

# Run terraform command with all passed arguments
echo -e "${BLUE}🏗️  Running: terraform $@${NC}"
echo ""

terraform "$@"
