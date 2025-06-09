output "service_url" {
  description = "URL of the deployed Cloud Run service"
  value       = google_cloud_run_v2_service.buy_it.uri
}

output "service_name" {
  description = "Name of the Cloud Run service"
  value       = google_cloud_run_v2_service.buy_it.name
}

output "artifact_registry_url" {
  description = "URL of the Artifact Registry repository"
  value       = google_artifact_registry_repository.repo.name
}

output "domain_name" {
  description = "Custom domain name mapped to the service"
  value       = google_cloud_run_domain_mapping.domain.name
}

output "domain_status" {
  description = "Status of the domain mapping"
  value       = google_cloud_run_domain_mapping.domain.status
}
