#!/bin/bash

# Utility script for managing DEV deployments
SERVICE_NAME="react-web-app-dev"
REGION="us-central1"

case "$1" in
  "logs")
    echo "📋 Fetching logs for $SERVICE_NAME..."
    gcloud run services logs read $SERVICE_NAME --region=$REGION --limit=50
    ;;
  "status")
    echo "📊 Service status for $SERVICE_NAME..."
    gcloud run services describe $SERVICE_NAME --region=$REGION --format="table(metadata.name,status.url,status.conditions[0].type,status.conditions[0].status)"
    ;;
  "url")
    SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")
    echo "🌐 Service URL: $SERVICE_URL"
    ;;
  "delete")
    echo "🗑️ Deleting $SERVICE_NAME..."
    gcloud run services delete $SERVICE_NAME --region=$REGION
    ;;
  "traffic")
    echo "🚦 Traffic allocation for $SERVICE_NAME..."
    gcloud run services describe $SERVICE_NAME --region=$REGION --format="table(status.traffic[].revisionName,status.traffic[].percent)"
    ;;
  *)
    echo "DEV Deployment Utilities"
    echo "Usage: $0 {logs|status|url|delete|traffic}"
    echo ""
    echo "Commands:"
    echo "  logs    - View recent logs"
    echo "  status  - Show service status"
    echo "  url     - Get service URL"
    echo "  delete  - Delete the dev service"
    echo "  traffic - Show traffic allocation"
    ;;
esac
