terraform {
  backend "gcs" {
    bucket = "product-terraform-state"
    prefix = "dev"
  }
}

