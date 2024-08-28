terraform {
  required_providers {
    aws = {
      source    = "hashicorp/aws"
      version   = "~> 4.0"
    }
  }
  required_version = ">= 1.3.0"
}

locals {
  serverless_iiif_app_id        = "arn:aws:serverlessrepo:us-east-1:625046682746:applications/serverless-iiif"
  serverless_iiif_app_version   = "5.0.5"
}

resource "aws_serverlessapplicationrepository_cloudformation_stack" "serverless_iiif" {
  name                      = var.stack_name
  application_id            = local.serverless_iiif_app_id
  semantic_version          = local.serverless_iiif_app_version
  capabilities              = ["CAPABILITY_IAM"]
  parameters = {
    CorsAllowCredentials    = var.cors_allow_credentials
    CorsAllowHeaders        = var.cors_allow_headers
    CorsAllowOrigin         = var.cors_allow_origin
    CorsExposeHeaders       = var.cors_expose_headers
    CorsMaxAge              = var.cors_max_age
    ForceHost               = var.force_host
    IiifLambdaMemory        = var.iiif_lambda_memory
    IiifLambdaTimeout       = var.iiif_lambda_timeout
    PixelDensity            = var.pixel_density
    Preflight               = var.preflight
    ResolverTemplate        = var.resolver_template
    SharpLayer              = var.sharp_layer
    SourceBucket            = var.source_bucket
  }
}
