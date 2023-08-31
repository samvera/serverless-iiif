variable "cache_hostname" {
  description   = "Hostname to use as an alias for the CloudFront distribution"
  type          = string
}

variable "cache_ssl_certificate_arn" {
  description   = "SSL certificate to use for the CloudFront distribution"
  type          = string
}

variable "iiif_source_bucket" {
    type          = string
    description   = "Name of bucket containing source images"
}

variable "tags" {
    type          = map(string)
    description   = "Tags to apply to all deployed resources"
    default       = {}
}
