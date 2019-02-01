#!/usr/bin/env bash

if [[ "$TARGET_ENV" != "staging" ]]; then
  echo "The build will not auto-deploy"
  exit 0
fi

BUCKET_NAME=$1
echo "Deploying to $BUCKET_NAME"
aws s3 sync --delete build s3://$BUCKET_NAME/build --cache-control max-age=3600

if [[ ! -z "$CF_DISTRO_ID" ]]; then
	aws cloudfront create-invalidation --distribution-id $CF_DISTRO_ID --paths /index.html /version.json
fi
