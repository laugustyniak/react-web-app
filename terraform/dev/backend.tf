terraform {
  backend "gcs" {
    bucket = "insbuy-terraform-state"
    prefix = "dev"
  }
}

