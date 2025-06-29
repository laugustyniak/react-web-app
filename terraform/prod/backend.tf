terraform {
  backend "gcs" {
    bucket = "product-app-terraform-state"
    prefix = "prod"
  }
}
