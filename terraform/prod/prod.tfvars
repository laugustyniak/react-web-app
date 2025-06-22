# Production environment configuration
service_name     = "buy-it-prod"
docker_repo_name = "buy-it-prod-repo"
container_image  = "us-central1-docker.pkg.dev/insbay-b32351/buy-it-prod-repo/buy-it:0.11.0"
environment      = "prod"
domain_name      = "prod.buy-it.ai"

# Resource limits for production
cpu_limit     = "1"
memory_limit  = "512Mi"
min_instances = 1
max_instances = 10

# API configuration
backend_api_url = "https://buy-it-api-prod-731225278324.us-central1.run.app"
# api_key should be set via environment variable: TF_VAR_api_key

enable_domain_mapping = false
