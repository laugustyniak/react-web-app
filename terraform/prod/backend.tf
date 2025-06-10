terraform {
  backend "gcs" {
    bucket = "insbuy-terraform-state"
    prefix = "prod"
  }
}
