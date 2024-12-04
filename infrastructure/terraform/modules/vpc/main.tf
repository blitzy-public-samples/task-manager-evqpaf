# Required by: Technical Specification/2.2 Component Details/Data Storage Components
# Infrastructure as Code - Implements the main configuration for the VPC module

# Human Tasks:
# 1. Ensure AWS credentials are properly configured
# 2. Verify the AWS region is set correctly in the provider configuration
# 3. Review and adjust CIDR blocks according to network design requirements
# 4. Confirm availability zone selection matches the target deployment region

# Provider versions
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws" # version 5.0.0
      version = "~> 5.0.0"
    }
  }
  required_version = "~> 1.5.0"
}

# Create the VPC
resource "aws_vpc" "main" {
  cidr_block           = var.cidr_block
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = var.vpc_name
  }
}

# Create the public subnet
resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_cidr
  availability_zone       = var.availability_zone
  map_public_ip_on_launch = true

  tags = {
    Name = var.public_subnet_name
  }
}

# Create the private subnet
resource "aws_subnet" "private" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_subnet_cidr
  availability_zone = var.availability_zone

  tags = {
    Name = var.private_subnet_name
  }
}

# Create the Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = var.internet_gateway_name
  }
}

# Create the public route table
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = var.public_route_table_name
  }
}

# Create the route for internet access
resource "aws_route" "public_internet_gateway" {
  route_table_id         = aws_route_table.public.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.main.id
}

# Associate the public subnet with the public route table
resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

# Create the main route table for the VPC (used by private subnet by default)
resource "aws_default_route_table" "private" {
  default_route_table_id = aws_vpc.main.default_route_table_id

  tags = {
    Name = "${var.vpc_name}-default-rt"
  }
}

# Enable VPC flow logs for network monitoring
resource "aws_flow_log" "main" {
  iam_role_arn    = aws_iam_role.vpc_flow_log.arn
  log_destination = aws_cloudwatch_log_group.vpc_flow_log.arn
  traffic_type    = "ALL"
  vpc_id          = aws_vpc.main.id
}

# Create CloudWatch log group for VPC flow logs
resource "aws_cloudwatch_log_group" "vpc_flow_log" {
  name              = "/aws/vpc/${var.vpc_name}/flow-logs"
  retention_in_days = 30
}

# Create IAM role for VPC flow logs
resource "aws_iam_role" "vpc_flow_log" {
  name = "${var.vpc_name}-vpc-flow-log-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "vpc-flow-logs.amazonaws.com"
        }
      }
    ]
  })
}

# Attach policy to the VPC flow logs IAM role
resource "aws_iam_role_policy" "vpc_flow_log" {
  name = "${var.vpc_name}-vpc-flow-log-policy"
  role = aws_iam_role.vpc_flow_log.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogGroups",
          "logs:DescribeLogStreams"
        ]
        Effect = "Allow"
        Resource = "*"
      }
    ]
  })
}

# Create NACL for public subnet
resource "aws_network_acl" "public" {
  vpc_id     = aws_vpc.main.id
  subnet_ids = [aws_subnet.public.id]

  ingress {
    protocol   = -1
    rule_no    = 100
    action     = "allow"
    cidr_block = "0.0.0.0/0"
    from_port  = 0
    to_port    = 0
  }

  egress {
    protocol   = -1
    rule_no    = 100
    action     = "allow"
    cidr_block = "0.0.0.0/0"
    from_port  = 0
    to_port    = 0
  }

  tags = {
    Name = "${var.vpc_name}-public-nacl"
  }
}

# Create NACL for private subnet
resource "aws_network_acl" "private" {
  vpc_id     = aws_vpc.main.id
  subnet_ids = [aws_subnet.private.id]

  ingress {
    protocol   = -1
    rule_no    = 100
    action     = "allow"
    cidr_block = var.cidr_block
    from_port  = 0
    to_port    = 0
  }

  egress {
    protocol   = -1
    rule_no    = 100
    action     = "allow"
    cidr_block = "0.0.0.0/0"
    from_port  = 0
    to_port    = 0
  }

  tags = {
    Name = "${var.vpc_name}-private-nacl"
  }
}