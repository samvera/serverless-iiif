terraform {
  required_providers {
    aws = {
      source    = "hashicorp/aws"
      version   = ">= 4.0"
    }
  }
  required_version = ">= 1.3.0"
}

locals {
  serverless_iiif_app_id      = "arn:aws:serverlessrepo:us-east-1:625046682746:applications/serverless-iiif"
  serverless_iiif_app_version = "8.0.4"

  _all_parameters = {
    CorsAllowCredentials    = tostring(var.cors_allow_credentials)
    CorsAllowHeaders        = var.cors_allow_headers
    CorsAllowOrigin         = var.cors_allow_origin
    CorsExposeHeaders       = var.cors_expose_headers
    CorsMaxAge              = var.cors_max_age != null ? tostring(var.cors_max_age) : null
    CreateMetadataFunction  = var.create_metadata_function != null ? tostring(var.create_metadata_function) : null
    ForceHost               = var.force_host
    IiifLambdaMemory        = var.iiif_lambda_memory != null ? tostring(var.iiif_lambda_memory) : null
    IiifLambdaTimeout       = var.iiif_lambda_timeout != null ? tostring(var.iiif_lambda_timeout) : null
    PixelDensity            = var.pixel_density != null ? tostring(var.pixel_density) : null
    Preflight               = var.preflight
    ResolverTemplate        = var.resolver_template
    SourceBucket            = var.source_bucket
  }
  parameters = { for k, v in local._all_parameters : k => v if v != null }
}

resource "aws_serverlessapplicationrepository_cloudformation_stack" "serverless_iiif" {
  name             = var.stack_name
  application_id   = local.serverless_iiif_app_id
  semantic_version = local.serverless_iiif_app_version
  capabilities     = ["CAPABILITY_IAM"]
  parameters       = local.parameters
}
