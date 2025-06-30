#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if API key is set
if [ -z "$TF_VAR_API_KEY" ]; then
    print_error "TF_VAR_API_KEY environment variable is not set"
    echo "Please set it with: export TF_VAR_API_KEY=\"your-api-key\""
    exit 1
fi

# Change to terraform directory
cd terraform

print_status "Starting Terraform deployment tests..."

# Test 1: Validate configuration
print_status "Test 1: Validating Terraform configuration..."
if terraform validate; then
    print_status "✅ Terraform configuration is valid"
else
    print_error "❌ Terraform configuration validation failed"
    exit 1
fi

# Test 2: Check formatting
print_status "Test 2: Checking Terraform formatting..."
if terraform fmt -check; then
    print_status "✅ Terraform files are properly formatted"
else
    print_warning "⚠️  Terraform files need formatting. Run 'terraform fmt' to fix."
fi

# Test 3: Initialize Terraform
print_status "Test 3: Initializing Terraform..."
if terraform init; then
    print_status "✅ Terraform initialized successfully"
else
    print_error "❌ Terraform initialization failed"
    exit 1
fi

# Test 4: Plan development deployment
print_status "Test 4: Planning development deployment..."
if terraform plan -var-file="dev.tfvars" -out=dev.tfplan; then
    print_status "✅ Development deployment plan created successfully"
else
    print_error "❌ Development deployment planning failed"
    exit 1
fi

# Test 5: Plan production deployment
print_status "Test 5: Planning production deployment..."
if terraform plan -var-file="prod.tfvars" -out=prod.tfplan; then
    print_status "✅ Production deployment plan created successfully"
else
    print_error "❌ Production deployment planning failed"
    exit 1
fi

# Test 6: Optional - Deploy to dev and test
read -p "Do you want to deploy to development environment for testing? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Test 6: Deploying to development environment..."

    if terraform apply -var-file="dev.tfvars" -auto-approve; then
        print_status "✅ Development deployment successful"

        # Get the service URL
        SERVICE_URL=$(terraform output -raw service_url 2>/dev/null || echo "")

        if [ -n "$SERVICE_URL" ]; then
            print_status "Testing deployed service at: $SERVICE_URL"

            # Wait a bit for the service to be ready
            sleep 10

            # Test health check endpoint
            if curl -f -s "$SERVICE_URL/api/healthcheck" > /dev/null; then
                print_status "✅ Service health check passed"
            else
                print_warning "⚠️  Service health check failed or endpoint not ready"
            fi
        fi

        # Ask if user wants to destroy the test deployment
        read -p "Do you want to destroy the test deployment? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_status "Destroying test deployment..."
            terraform destroy -var-file="dev.tfvars" -auto-approve
            print_status "✅ Test deployment destroyed"
        else
            print_warning "Test deployment left running. Don't forget to destroy it later!"
        fi
    else
        print_error "❌ Development deployment failed"
        exit 1
    fi
fi

# Clean up plan files
rm -f *.tfplan

print_status "🎉 All Terraform tests completed successfully!"
print_status "Your Terraform configuration is ready for deployment."

echo
echo "Next steps:"
echo "1. Deploy to development: npm run deploy:dev"
echo "2. Test the development deployment"
echo "3. Deploy to production: npm run deploy"
