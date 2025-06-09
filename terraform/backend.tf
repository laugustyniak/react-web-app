# Terraform state backend configuration
# Uncomment and configure this after creating a GCS bucket for state storage

# terraform {
#   backend "gcs" {
#     bucket = "your-terraform-state-bucket"
#     prefix = "react-web-app"
#   }
# }

# To set up the backend:
# 1. Create a GCS bucket: gsutil mb gs://your-terraform-state-bucket
# 2. Enable versioning: gsutil versioning set on gs://your-terraform-state-bucket
# 3. Uncomment the backend configuration above
# 4. Run: terraform init -migrate-state
