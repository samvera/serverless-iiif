# serverless-iiif

Forked from [nulib/serverless-iiif](https://github.com/nulib/serverless-iiif).

## Deployment

* Set up a `figgy-deploy` AWS profile. You can get the AccessID/AccessKey from
`lpass show --all Shared-ITIMS-Passwords/Figgy/FiggyAWS`
* Configure the profile via `aws configure --profile figgy-deploy`
  - Set default region to us-east-1
  - Set default output format to json
* `cd dependencies/nodejs && npm install` must be done before deploy.
* `./deploy.sh staging` will deploy the stack to staging.
* `./deploy.sh production` will deploy the stack to staging.
