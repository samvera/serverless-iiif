locals {
  outputs = aws_serverlessapplicationrepository_cloudformation_stack.serverless_iiif.outputs
}

output "stack_id" {
  value         = aws_serverlessapplicationrepository_cloudformation_stack.serverless_iiif.id
  description   = "The ID of the serverless-iiif application stack"
}

output "serverless_iiif_endpoint_v2" {
  value = local.outputs.EndpointV2
}

output "serverless_iiif_endpoint_v3" {
  value = local.outputs.EndpointV3
}

output "serverless_iiif_function_domain" {
  value = local.outputs.FunctionDomain
}

output "serverless_iiif_function_url" {
  value = local.outputs.FunctionUrl
}
