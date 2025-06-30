# Production environment configuration
service_name     = "app-prod"
docker_repo_name = "app-prod-repo"
container_image  = "us-central1-docker.pkg.dev/insbay-b32351/app-prod-repo/app:0.11.1"
environment      = "prod"
domain_name      = "prod.product.app"

# Resource limits for production
cpu_limit     = "1"
memory_limit  = "512Mi"
min_instances = 1
max_instances = 10

# API configuration
backend_api_url = "https://product-api-prod-731225278324.us-central1.run.app"
# api_key should be set via environment variable: TF_VAR_API_KEY

enable_domain_mapping = false
