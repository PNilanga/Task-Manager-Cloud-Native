# ECR is AWS's Docker Hub — a place to store your Docker images
resource "aws_ecr_repository" "app" {
  name                 = var.project_name
  image_tag_mutability = "MUTABLE"

  # Automatically scan images for known vulnerabilities
  image_scanning_configuration {
    scan_on_push = true
  }

  # Clean up old images to save money
  lifecycle {
    prevent_destroy = false
  }
}

# Keep only the last 10 images (delete older ones automatically)
resource "aws_ecr_lifecycle_policy" "app" {
  repository = aws_ecr_repository.app.name

  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep last 10 images"
      selection = {
        tagStatus   = "any"
        countType   = "imageCountMoreThan"
        countNumber = 10
      }
      action = {
        type = "expire"
      }
    }]
  })
}
