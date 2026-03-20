# A VPC is your own private network in the cloud.
# Think of it as your own private data center.
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "${var.project_name}-vpc"
  cidr = "10.0.0.0/16"      # IP range: 10.0.0.0 – 10.0.255.255 (65,536 IPs)

  azs             = ["${var.aws_region}a", "${var.aws_region}b"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]  # Internal resources (not internet-facing)
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]  # Internet-facing resources

  enable_nat_gateway = false  # Disabled to save ~$32/mo (tasks use public subnets)
  single_nat_gateway = false

  # Tags required for Kubernetes to discover subnets
  public_subnet_tags = {
    "kubernetes.io/role/elb" = 1
  }
  private_subnet_tags = {
    "kubernetes.io/role/internal-elb" = 1
  }
}