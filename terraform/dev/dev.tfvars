# non gitignored because it contains non-sensitive data, and it is very usable for development

# Development environment configuration
service_name     = "product-dev"
docker_repo_name = "product-dev-repo"
container_image  = "us-central1-docker.pkg.dev/insbay-b32351/product-dev-repo/product:0.11.0"
environment      = "dev"
domain_name      = "dev.product.ai"

# Resource limits for dev (smaller than prod)
cpu_limit     = "1"
memory_limit  = "512Mi"
min_instances = 1
max_instances = 5

# API configuration
backend_api_url = "https://product-api-dev-731225278324.us-central1.run.app"
# api_key should be set via environment variable: TF_VAR_API_KEY

enable_domain_mapping = false
