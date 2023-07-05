output "stack_id" {
  value         = aws_serverlessapplicationrepository_cloudformation_stack.serverless_iiif.id
  description   = "The ID of the serverless-iiif application stack"
}

output "outputs" {
  value         = aws_serverlessapplicationrepository_cloudformation_stack.serverless_iiif.outputs
  description   = "A map of outputs from the serverless-iiif application"
}
