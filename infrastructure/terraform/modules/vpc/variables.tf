# Required by: Technical Specification/2.2 Component Details/Data Storage Components
# Infrastructure as Code - Defining configurable input variables for modular VPC setup

variable "vpc_name" {
  description = "The name of the VPC."
  type        = string
  
  validation {
    condition     = length(var.vpc_name) > 0
    error_message = "VPC name cannot be empty."
  }
}

variable "cidr_block" {
  description = "The CIDR block for the VPC."
  type        = string
  
  validation {
    condition     = can(cidrhost(var.cidr_block, 0))
    error_message = "Must be a valid CIDR block."
  }
}

variable "public_subnet_cidr" {
  description = "The CIDR block for the public subnet."
  type        = string
  
  validation {
    condition     = can(cidrhost(var.public_subnet_cidr, 0))
    error_message = "Must be a valid CIDR block."
  }
}

variable "private_subnet_cidr" {
  description = "The CIDR block for the private subnet."
  type        = string
  
  validation {
    condition     = can(cidrhost(var.private_subnet_cidr, 0))
    error_message = "Must be a valid CIDR block."
  }
}

variable "availability_zone" {
  description = "The availability zone for the subnets."
  type        = string
  
  validation {
    condition     = can(regex("^[a-z]{2}-[a-z]+-[0-9][a-z]$", var.availability_zone))
    error_message = "Must be a valid AWS availability zone format (e.g., us-east-1a)."
  }
}

variable "internet_gateway_name" {
  description = "The name of the internet gateway."
  type        = string
  
  validation {
    condition     = length(var.internet_gateway_name) > 0
    error_message = "Internet gateway name cannot be empty."
  }
}

variable "public_route_table_name" {
  description = "The name of the public route table."
  type        = string
  
  validation {
    condition     = length(var.public_route_table_name) > 0
    error_message = "Public route table name cannot be empty."
  }
}

variable "private_subnet_name" {
  description = "The name of the private subnet."
  type        = string
  
  validation {
    condition     = length(var.private_subnet_name) > 0
    error_message = "Private subnet name cannot be empty."
  }
}

variable "public_subnet_name" {
  description = "The name of the public subnet."
  type        = string
  
  validation {
    condition     = length(var.public_subnet_name) > 0
    error_message = "Public subnet name cannot be empty."
  }
}