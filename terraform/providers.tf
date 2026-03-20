# This tells Terraform we're working with AWS
terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Store Terraform state remotely (so your team can collaborate)
  # Uncomment after creating the S3 bucket manually first
  # backend "s3" {
  #   bucket = "your-terraform-state-bucket"
  #   key    = "devops-capstone/terraform.tfstate"
  #   region = "us-east-1"
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "devops-capstone"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}
