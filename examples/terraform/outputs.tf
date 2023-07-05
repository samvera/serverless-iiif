output "endpoints" {
  value = {
    v2 = "https://${var.cache_hostname}/iiif/2"
    v3 = "https://${var.cache_hostname}/iiif/3"
  }
}

output "distribution_id" {
  value = aws_cloudfront_distribution.caching_distribution.id
}
