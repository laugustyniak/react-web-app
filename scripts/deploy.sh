#!/bin/bash
set -e

# Get the current version from package.json
VERSION=$(jq -r .version package.json)
IMAGE_NAME="us-central1-docker.pkg.dev/insbay-b32351/cloud-run-source-deploy/react-web-app"
REGION="us-central1"

# Create a valid tag by replacing periods with hyphens
VALID_TAG="v$(echo $VERSION | tr '.' '-')"

echo "🔨 Building Docker image with version $VERSION..."
docker build -t "$IMAGE_NAME:$VERSION" .

# Also tag as latest
echo "🏷️ Adding latest tag..."
docker tag "$IMAGE_NAME:$VERSION" "$IMAGE_NAME:latest"

# Check if Docker is configured for GCP Artifact Registry
if ! grep -q "us-central1-docker.pkg.dev" ~/.docker/config.json 2>/dev/null; then
  echo "🔑 Configuring Docker authentication for GCP Artifact Registry..."
  gcloud auth configure-docker us-central1-docker.pkg.dev --quiet
fi

echo "⬆️ Pushing images to Artifact Registry..."
docker push "$IMAGE_NAME:$VERSION"
docker push "$IMAGE_NAME:latest"

echo "🚀 Deploying to Cloud Run..."
gcloud run deploy react-web-app \
  --image="$IMAGE_NAME:$VERSION" \
  --tag="$VALID_TAG" \
  --region="$REGION" \
  --platform=managed \
  --allow-unauthenticated

echo "✅ Deployment complete! Service deployed with version $VERSION and tag $VALID_TAG."
