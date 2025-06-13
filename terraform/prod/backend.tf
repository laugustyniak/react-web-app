terraform {
  backend "gcs" {
    bucket = "buy-it-terraform-state"
    prefix = "prod"
  }
}
