variable "stack_name" {
    type          = string
    description   = "The stack name for the deployed serverless-iiif application"
}

variable "cors_allow_credentials" {
    type          = bool
    description   = <<-END
      Value of the CORS `Access-Control-Allow-Credentials` response header.
      Must be `true` to allow requests with `Authorization` and/or
      `Cookie` headers.
    END
    default       = false
}

variable "cors_allow_headers" {
    type          = string
    description   = "Value of the CORS `Access-Control-Allow-Headers` response header"
    default       = "*"
}

variable "cors_allow_origin" {
    type          = string
    description   = <<-END
      Value of the CORS `Access-Control-Allow-Origin` response header.
      Use the special value `REFLECT_ORIGIN` to copy the value from the
      `Origin` request header (required to emulate `*` for XHR requests
      using `Authorization` and/or `Cookie` headers).
    END
    default       = "*"
}

variable "cors_expose_headers" {
    type          = string
    description   = "Value of the CORS `Access-Control-Expose-Headers` response header"
    default       = "cache-control,content-language,content-length,content-type,date,expires,last-modified,pragma"
}

variable "cors_max_age" {
    type          = number
    description   = "Value of the CORS `Access-Control-MaxAge` response header"
    default       = 3600
}

variable "force_host" {
    type          = string
    description   = "Forced hostname to use in responses"
    default       = ""
}

variable "iiif_lambda_memory" {
    type          = number
    description   = "The memory provisioned for the lambda"
    default       = 3008

    validation {
      condition       = var.iiif_lambda_memory >= 128 && var.iiif_lambda_memory <= 10240
      error_message   = "iiif_lambda_memory must be between 128 and 10240"
    }
}

variable "iiif_lambda_timeout" {
    type          = number
    description   = "The timeout for the lambda"
    default       = 10
}

variable "pixel_density" {
    type          = number
    description   = "Hardcoded DPI/Pixel Density/Resolution to encode in output images"
    default       = 0

    validation {
      condition       = var.pixel_density >= 0
      error_message   = "pixel_density must be >= 0"
    }
}

variable "preflight" {
    type          = string
    description   = "Indicates whether the function should expect preflight headers"
    default       = "false"
}

variable "resolver_template" {
    type          = string
    description   = "A printf-style format string that determines the location of source image within the bucket given the image ID"
    default       = "%s.tif"
}

variable "sharp_layer" {
    type          = string
    description   = "ARN of a custom AWS Lambda Layer containing the sharp and libvips dependencies"
    default       = ""
}

variable "source_bucket" {
    type          = string
    description   = "Name of the S3 bucket containing source images"
}

variable "tags" {
    type          = map(string)
    description   = "Tags to apply to all deployed resources"
    default       = {}
}