# Terraform Deployment Guide

This project uses Terraform for infrastructure as code to deploy the React web application to Google Cloud Run.

## Prerequisites

1. **Google Cloud SDK**: Install and authenticate with `gcloud auth login`
2. **Terraform**: Install Terraform >= 1.0
3. **Docker**: For building container images
4. **API Key**: Set your backend API key as an environment variable

## Quick Start

### 1. Set up API Key

```bash
export TF_VAR_api_key="your-buyit-api-key-here"
```

### 2. Initialize Terraform

```bash
npm run infra:init
```

### 3. Deploy to Development

```bash
npm run deploy:dev
```

### 4. Deploy to Production

```bash
npm run deploy
```

## Available Commands

### Deployment Commands

- `npm run deploy` - Deploy to production
- `npm run deploy:dev` - Deploy to development
- `npm run deploy:no-build` - Deploy to production without rebuilding Docker image

### Infrastructure Management

- `npm run infra:init` - Initialize Terraform
- `npm run infra:plan:dev` - Plan development deployment
- `npm run infra:plan:prod` - Plan production deployment
- `npm run infra:destroy:dev` - Destroy development infrastructure
- `npm run infra:destroy:prod` - Destroy production infrastructure

### Manual Deployment Script

You can also use the deployment script directly:

```bash
# Deploy to development
./scripts/deploy-terraform.sh --env dev

# Deploy to production
./scripts/deploy-terraform.sh --env prod

# Deploy without building (if image already exists)
./scripts/deploy-terraform.sh --env prod --no-build

# Deploy without pushing (for local testing)
./scripts/deploy-terraform.sh --env dev --no-push
```

## Configuration

### Environment Variables

The deployment requires the following environment variable:

- `TF_VAR_api_key` - Your Buy It API key for backend communication

### Environment Files

- `terraform/dev.tfvars` - Development environment configuration
- `terraform/prod.tfvars` - Production environment configuration

### Customizing Configuration

Edit the `.tfvars` files to customize:

- Resource limits (CPU, memory)
- Scaling settings (min/max instances)
- Service names
- API endpoints

## Infrastructure Components

The Terraform configuration creates:

1. **Artifact Registry Repository** - For storing Docker images
2. **Cloud Run Service** - The main application service
3. **IAM Bindings** - Public access permissions

## Testing Terraform Deployment

### Automated Testing

Run the comprehensive test suite:

```bash
# Set your API key first
export TF_VAR_api_key="your-buyit-api-key-here"

# Run all tests
npm run test:terraform
```

The test script will:

- Validate Terraform configuration
- Check code formatting
- Initialize Terraform
- Plan both dev and prod deployments
- Optionally deploy to dev and test the service
- Clean up test resources

### Manual Testing Steps

#### 1. Configuration Validation

```bash
cd terraform
terraform validate
terraform fmt -check
```

#### 2. Planning Tests

```bash
# Test development deployment plan
npm run infra:plan:dev

# Test production deployment plan
npm run infra:plan:prod
```

#### 3. Development Environment Testing

```bash
# Deploy to dev first
export TF_VAR_api_key="your-api-key"
npm run deploy:dev

# Test the deployed service
curl https://your-dev-service-url/api/healthcheck

# Check deployment status
terraform show

# Clean up when done
npm run infra:destroy:dev
```

#### 4. Local Testing (No Registry Push)

```bash
# Test deployment process without pushing to registry
./scripts/deploy-terraform.sh --env dev --no-push
```

#### 5. Production Readiness Check

```bash
# Validate production configuration
terraform plan -var-file="prod.tfvars"

# Check for any differences
terraform plan -detailed-exitcode -var-file="prod.tfvars"
```

### Testing Checklist

Before deploying to production:

- All tests pass with `npm run test:terraform`
- Development deployment works correctly
- Service responds to health checks
- Environment variables are properly set
- Resource limits are appropriate
- Scaling configuration is correct
- API endpoints are accessible
- Docker image builds successfully

### Continuous Testing

For ongoing validation:

```bash
# Quick validation check
terraform validate && terraform fmt -check

# Plan without applying
terraform plan -var-file="dev.tfvars" -detailed-exitcode

# Test service endpoints after deployment
curl -f https://your-service-url/api/healthcheck
```

## State Management

For production use, consider setting up remote state storage:

1. Create a GCS bucket for Terraform state:

   ```bash
   gsutil mb gs://your-terraform-state-bucket
   gsutil versioning set on gs://your-terraform-state-bucket
   ```

2. Uncomment and configure the backend in `terraform/backend.tf`

3. Migrate existing state:

   ```bash
   cd terraform
   terraform init -migrate-state
   ```

## Troubleshooting

### Common Issues

1. **API Key Not Set**

   ```bash
   Error: TF_VAR_api_key environment variable is not set
   ```

   Solution: Set the API key environment variable before deployment.

2. **Docker Authentication**

   ```bash
   Error: unauthorized: authentication required
   ```

   Solution: The script automatically configures Docker authentication, but you can manually run:

   ```bash
   gcloud auth configure-docker us-central1-docker.pkg.dev
   ```

3. **Terraform State Lock**

   ```bash
   Error: state lock
   ```

   Solution: If using remote state, wait for concurrent operations to complete or force unlock if needed.

### Viewing Logs

After deployment, view service logs:

```bash
# Development
gcloud logs tail --follow --filter="resource.type=cloud_run_revision AND resource.labels.service_name=react-web-app-dev"

# Production
gcloud logs tail --follow --filter="resource.type=cloud_run_revision AND resource.labels.service_name=react-web-app"
```

## Migration from Old Scripts

The old bash deployment scripts have been replaced with this Terraform setup. Key improvements:

- Infrastructure as Code
- Environment variable management
- Consistent dev/prod environments
- Better resource management
- State tracking
- Rollback capabilities

To migrate from the old setup:

1. Remove old deployment scripts (they're kept for reference)
2. Use the new npm scripts for deployment
3. Set up the API key environment variable
4. Deploy using the new Terraform workflow
