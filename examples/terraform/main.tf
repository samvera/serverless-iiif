terraform {
  required_providers {
    aws = "~> 4.0"
  }
  required_version = ">= 1.3.0"
}

provider "aws" {
  default_tags {
    tags = var.tags
  }
}

locals {
  hostname_parts = split(".", var.cache_hostname)
  hosted_zone_name = join(".", slice(local.hostname_parts, 1, length(local.hostname_parts)))
}

resource "random_string" "resource_name" {
  length    = 8
  lower     = true
  upper     = true
  numeric   = true
  special   = false
}

resource "aws_cloudfront_response_headers_policy" "response_header_policy" {
  comment = "Allows IIIF CORS response headers"
  name    = "allow-cors-response-headers-${random_string.resource_name.result}"

  cors_config {
    access_control_allow_credentials    = false
    access_control_allow_headers {
      items = ["*"]
    }
    access_control_allow_methods {
      items = ["GET", "OPTIONS"]
    }
    access_control_allow_origins {
      items = ["*"]
    }
    access_control_expose_headers {
      items = [
        "cache-control", "content-language", "content-length", "content-type", 
        "date", "expires", "last-modified", "pragma"
      ]
    }
    access_control_max_age_sec    = 3600
    origin_override               = false
  }
}

module "serverless_iiif" {
  source          = "../../extras/terraform"
  source_bucket   = var.iiif_source_bucket
  stack_name      = "serverless-iiif-${random_string.resource_name.result}"
  force_host      = var.cache_hostname
}

resource "aws_cloudfront_distribution" "caching_distribution" {
  enabled       = true
  price_class   = "PriceClass_100"
  aliases       = [var.cache_hostname]

  origin {
    origin_id = "iiif_lambda"
    custom_origin_config {
      http_port               = 80
      https_port              = 443
      origin_ssl_protocols    = ["TLSv1.2"]
      origin_protocol_policy  = "https-only"
    }
    domain_name = module.serverless_iiif.outputs.FunctionDomain
  }

  default_cache_behavior {
    target_origin_id              = "iiif_lambda"
    viewer_protocol_policy        = "https-only"
    allowed_methods               = ["GET", "HEAD", "OPTIONS"]
    cached_methods                = ["GET", "HEAD", "OPTIONS"]
    cache_policy_id               = "658327ea-f89d-4fab-a63d-7e88639e58f6"
    response_headers_policy_id    = aws_cloudfront_response_headers_policy.response_header_policy.id
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
      locations        = []
    }
  }

  viewer_certificate {
    acm_certificate_arn               = var.cache_ssl_certificate_arn
    minimum_protocol_version          = "TLSv1"
    ssl_support_method                = "sni-only"
  }
}

data "aws_route53_zone" "cache_hosted_zone" {
  name = "${local.hosted_zone_name}."
}

resource "aws_route53_record" "dns_record" {
  name    = var.cache_hostname
  type    = "A"
  zone_id = data.aws_route53_zone.cache_hosted_zone.id
  alias {
    name                      = aws_cloudfront_distribution.caching_distribution.domain_name
    zone_id                   = aws_cloudfront_distribution.caching_distribution.hosted_zone_id
    evaluate_target_health    = true
  }
}