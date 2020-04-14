# serverless-iiif

Forked from [nulib/serverless-iiif](https://github.com/nulib/serverless-iiif).

## Deployment

* Set up a `figgy-deploy` AWS profile. You can get the AccessID/AccessKey from
`lpass show --all Shared-ITIMS-Passwords/Figgy/FiggyAWS`
* Configure the profile via `aws configure --profile figgy-deploy`
  - Set default region to us-east-1
  - Set default output format to json
* `cd dependencies/nodejs && docker run -v "$PWD":/var/task lambci/lambda:build-nodejs12.x npm install` must be done before deploy.
  - SHARP dependency must be installed in a similar environment to Lambda.
* `./deploy.sh staging` will deploy the stack to staging.
* `./deploy.sh production` will deploy the stack to staging.
