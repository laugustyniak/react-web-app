terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# Get project data
data "google_project" "project" {}

# Artifact Registry Repository
resource "google_artifact_registry_repository" "repo" {
  location      = var.region
  repository_id = var.docker_repo_name
  description   = "Docker repository for Buy-It React web app (${var.environment})"
  format        = "DOCKER"
}

# Cloud Run Service
resource "google_cloud_run_v2_service" "buy_it" {
  name     = var.service_name
  location = var.region

  template {
    containers {
      image = var.container_image

      ports {
        container_port = 8080
      }

      env {
        name  = "NODE_ENV"
        value = "production"
      }

      env {
        name  = "BACKEND_API_URL"
        value = var.backend_api_url
      }

      env {
        name  = "BUY_IT_API_KEY_1"
        value = var.api_key
      }

      resources {
        limits = {
          cpu    = var.cpu_limit
          memory = var.memory_limit
        }
      }
    }

    scaling {
      min_instance_count = var.min_instances
      max_instance_count = var.max_instances
    }
  }

  traffic {
    percent = 100
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
  }

  depends_on = [google_artifact_registry_repository.repo]
}

# IAM binding to allow unauthenticated access
resource "google_cloud_run_service_iam_binding" "public_access" {
  location = google_cloud_run_v2_service.buy_it.location
  service  = google_cloud_run_v2_service.buy_it.name
  role     = "roles/run.invoker"
  members  = ["allUsers"]
}

# Domain mapping for custom domain
resource "google_cloud_run_domain_mapping" "default" {
  count = var.enable_domain_mapping ? 1 : 0

  location = var.region
  name     = var.domain_name
  metadata {
    namespace = var.project_id
  }
  spec {
    route_name = google_cloud_run_v2_service.buy_it.name
  }
}
