# serverless-iiif Terraform module

Terraform module which deploys a [serverless-iiif](https://github.com/samvera/serverless-iiif) image service on AWS.

## Usage

### Minimal Example

```
module "serverless_iiif" {
  source          = "github.com/samvera/serverless-iiif//extras/terraform"
  source_bucket   = "iiif-images"
  stack_name      = "my-iiif-service"
}
```

### (Almost) Full Example

```
module "serverless_iiif" {
  source                    = "github.com/samvera/serverless-iiif//extras/terraform"
  source_bucket             = "iiif-images"
  stack_name                = "my-iiif-service"
  cors_allow_credentials    = true
  cors_allow_headers        = "X-Custom-Header,Upgrade-Insecure-Requests"
  cors_allow_origin         = "REFLECT_ORIGIN"
  cors_expose_headers       = "Content-Encoding"
  cors_max_age              = 600
  force_host                = "iiif.my-domain.edu"
  iiif_lambda_memory        = 2048
  iiif_lambda_timeout       = 120
  pixel_density             = 600
  preflight                 = true
  resolver_template         = "iiif/%s.tif"

  tags = {
    Project = "my-image-service"
  }
}
```

## Inputs

| Name                      | Description | Type | Default | Required |
|---------------------------|-------------|------|---------|:--------:|
| `cors_allow_credentials`  | Value of the CORS `Access-Control-Allow-Credentials` response header. Must be `true` to allow requests with `Authorization` and/or `Cookie` headers. | `bool` | `false` | no |
| `cors_allow_headers`      | Value of the CORS `Access-Control-Allow-Headers` response header | `string` | `"*"` | no |
| `cors_allow_origin`       | Value of the CORS `Access-Control-Allow-Origin` response header. Use the special value `REFLECT_ORIGIN` to copy the value from the `Origin` request header (required to emulate `*` for XHR requests using `Authorization` and/or `Cookie` headers). | `string` | `"*"` | no |
| `cors_expose_headers`     | Value of the CORS `Access-Control-Expose-Headers` response header | `string` | `"cache-control,content-language,content-length,content-type,date,expires,last-modified,pragma"` | no |
| `cors_max_age`            | Value of the CORS `Access-Control-MaxAge` response header | `number` | `3600` | no |
| `force_host`              | Forced hostname to use in responses | `string` | `""` | no |
| `iiif_lambda_memory`      | The memory provisioned for the lambda. | `number` | `3008` | no |
| `iiif_lambda_timeout`     | The timeout for the lambda | `number` | `10` | no |
| `pixel_density`           | Hardcoded DPI/Pixel Density/Resolution to encode in output images | `number` | `0` | no |
| `preflight`               | Indicates whether the function should expect preflight headers | `bool`   | `false` | no |
| `resolver_template`       | A printf-style format string that determines the location of source image within the bucket given the image ID | `string` | `"%s.tif"` | no |
| `sharp_layer`             | ARN of a custom AWS Lambda Layer containing the sharp and libvips dependencies | `string` | `""` | no |
| `source_bucket`           | Name of the S3 bucket containing source images | `string` | `""` | yes |
| `stack_name`              | The stack name for the deployed serverless-iiif application | `string` | `""` | yes |

## Outputs

| Name                      | Description                                           |
|---------------------------|-------------------------------------------------------|
| `stack_id`                | The ID of the serverless-iiif application stack       |
| `outputs`                 | A map of outputs from the serverless-iiif application |
| `outputs.EndpointV2`      | IIIF Image API v2 Endpoint                            |
| `outputs.EndpointV3`      | IIIF Image API v3 Endpoint                            |
| `outputs.FunctionDomain`  | IIIF Function Domain Name                             |
| `outputs.FunctionUrl`     | IIIF Function URL                                     |

## License

`serverless-iiif` is available under [the Apache 2.0 license](../../LICENSE).
