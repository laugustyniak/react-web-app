# Domain Mapping Setup for Cloud Run

This Terraform configuration now includes domain mapping for your Cloud Run services to custom domains.

## Configuration

### Domain Mapping

- **Development**: `dev.buy-it.ai` → `buy-it-dev` Cloud Run service
- **Production**: `prod.buy-it.ai` → `buy-it-prod` Cloud Run service

### Required Updates to .tfvars Files

Add the following line to your existing tfvars files:

**dev.tfvars:**

```hcl
domain_name = "dev.buy-it.ai"
```

**prod.tfvars:**

```hcl
domain_name = "prod.buy-it.ai"
```

## DNS Configuration Required

### Domain Verification Required First

Before running Terraform, you must verify domain ownership in Google Search Console. This is a prerequisite for Cloud Run domain mapping.

### Step 1: Verify Domain in Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add your domain `buy-it.ai` as a property
3. Verify ownership using one of the provided methods (DNS TXT record, HTML file, etc.)
4. Make sure both `dev.buy-it.ai` and `prod.buy-it.ai` subdomains are verified

### Step 2: Run Terraform

After domain verification, you'll need to configure DNS records for your domain. Google Cloud will provide you with DNS verification records that you need to add to your domain's DNS settings.

### Steps to Complete Domain Mapping

1. **Verify domain ownership** in Google Search Console (see above)
2. **Update your tfvars files** with the domain_name variable as shown above
3. **Run Terraform** to create the domain mapping resources
4. **Get DNS verification records** from the Terraform output or Google Cloud Console
5. **Add DNS records** to your domain registrar (where you manage buy-it.ai DNS)
6. **Wait for verification** (can take up to 24 hours)

### DNS Records You'll Need to Add

Google Cloud will require you to add TXT records for domain verification and potentially CNAME records for the actual mapping. The exact records will be shown in the Terraform output after deployment.

### Checking Domain Status

After deployment, you can check the domain mapping status with:

```bash
terraform output domain_status
```

### Important Notes

- Domain verification can take up to 24 hours
- Make sure you have admin access to the buy-it.ai domain DNS settings
- The domain mapping will only work after DNS verification is complete
- SSL certificates are automatically provisioned by Google Cloud after verification

## Troubleshooting

If domain mapping fails:

1. Verify DNS records are correctly configured
2. Check domain ownership verification
3. Ensure the domain is not already mapped to another service
4. Check Google Cloud Console for detailed error messages

## Security Considerations

- The tfvars files are in .gitignore to protect sensitive configuration
- Domain mapping requires proper DNS ownership verification
- SSL certificates are automatically managed by Google Cloud
