#!/usr/bin/env bash

echo "Deploying to staging"
BUCKET_NAME=web.staging.bigneon.com
aws s3 sync --delete build s3://$BUCKET_NAME/build --cache-control max-age=3600
