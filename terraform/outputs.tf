output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "ecr_repository_url" {
  description = "ECR Repository URL (use this in your Docker push commands)"
  value       = aws_ecr_repository.app.repository_url
}
