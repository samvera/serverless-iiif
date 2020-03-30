#!/usr/bin/env bash
if [ $1 == "production" ]
then
  sam deploy --stack-name=iiif-serverless-production \
  --s3-prefix=iiif-serverless-production \
  --parameter-overrides='StageName="production", SourceBucket="iiif-image-staging"'
elif [$1 == "staging" ]
then
  sam deploy --stack-name=iiif-serverless-staging \
  --s3-prefix=iiif-serverless-staging \
  --parameter-overrides='StageName="staging", SourceBucket="iiif-image-staging"'
else
  echo 'Please enter either production or staging as the environment'
fi
