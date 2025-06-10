variable "project_id" {
  description = "Google Cloud Project ID"
  type        = string
  default     = "insbay-b32351"
}

variable "docker_repo_name" {
  description = "Name of the Docker Artifact Registry repository (e.g., buy-it-dev-repo or buy-it-prod-repo)"
  type        = string
}

variable "region" {
  description = "Google Cloud region"
  type        = string
  default     = "us-central1"
}

variable "service_name" {
  description = "Name of the Cloud Run service"
  type        = string
}

variable "container_image" {
  description = "Container image URL"
  type        = string
}

variable "backend_api_url" {
  description = "Backend API URL"
  type        = string
}

variable "api_key" {
  description = "API key for backend service"
  type        = string
  sensitive   = true
  default     = null # Will be loaded from TF_VAR_api_key environment variable
}

variable "cpu_limit" {
  description = "CPU limit for the container"
  type        = string
  default     = "1"
}

variable "memory_limit" {
  description = "Memory limit for the container"
  type        = string
  default     = "512Mi"
}

variable "min_instances" {
  description = "Minimum number of instances"
  type        = number
  default     = 0
}

variable "max_instances" {
  description = "Maximum number of instances"
  type        = number
  default     = 10
}

variable "environment" {
  description = "Environment (dev, prod)"
  type        = string
}

variable "domain_name" {
  description = "Domain name for the service (e.g., dev.buy-it.ai, prod.buy-it.ai)"
  type        = string
}

variable "enable_domain_mapping" {
  description = "Whether to create the Google Cloud Run domain mapping"
  type        = bool
  default     = false
}
