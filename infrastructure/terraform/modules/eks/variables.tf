# Terraform AWS Provider version: 5.0.0
# Terraform version: 1.5.0

# Requirement addressed: Scalable Cloud Infrastructure
# Location: Technical Specification/2.2 Component Details/Core Components
# Description: Provides input variables for configuring the EKS cluster, ensuring flexibility and scalability.

variable "eks_cluster_name" {
  description = "The name of the EKS cluster."
  type        = string

  validation {
    condition     = can(regex("^[a-zA-Z][a-zA-Z0-9-]*$", var.eks_cluster_name))
    error_message = "EKS cluster name must start with a letter and can only contain letters, numbers, and hyphens."
  }
}

variable "node_instance_type" {
  description = "The instance type for the EKS worker nodes."
  type        = string
  default     = "t3.medium"

  validation {
    condition     = can(regex("^[a-z][1-9][.][a-z]+$", var.node_instance_type))
    error_message = "Instance type must be a valid AWS EC2 instance type."
  }
}

variable "desired_capacity" {
  description = "The desired number of worker nodes in the EKS cluster."
  type        = number
  default     = 2

  validation {
    condition     = var.desired_capacity > 0
    error_message = "Desired capacity must be greater than 0."
  }
}

variable "max_capacity" {
  description = "The maximum number of worker nodes in the EKS cluster."
  type        = number
  default     = 5

  validation {
    condition     = var.max_capacity >= var.desired_capacity
    error_message = "Maximum capacity must be greater than or equal to desired capacity."
  }
}

variable "min_capacity" {
  description = "The minimum number of worker nodes in the EKS cluster."
  type        = number
  default     = 1

  validation {
    condition     = var.min_capacity > 0 && var.min_capacity <= var.desired_capacity
    error_message = "Minimum capacity must be greater than 0 and less than or equal to desired capacity."
  }
}

variable "vpc_id" {
  description = "The ID of the VPC where the EKS cluster will be deployed."
  type        = string

  validation {
    condition     = can(regex("^vpc-[a-f0-9]{8,17}$", var.vpc_id))
    error_message = "VPC ID must be a valid AWS VPC ID (vpc-xxxxxxxx or vpc-xxxxxxxxxxxxxxxxx)."
  }
}

variable "subnet_ids" {
  description = "The list of subnet IDs where the EKS cluster will be deployed."
  type        = list(string)
  default     = []

  validation {
    condition     = length(var.subnet_ids) >= 2
    error_message = "At least two subnet IDs are required for high availability."
  }

  validation {
    condition     = alltrue([for subnet in var.subnet_ids : can(regex("^subnet-[a-f0-9]{8,17}$", subnet))])
    error_message = "All subnet IDs must be valid AWS subnet IDs (subnet-xxxxxxxx or subnet-xxxxxxxxxxxxxxxxx)."
  }
}

# Additional variables for enhanced cluster configuration
variable "kubernetes_version" {
  description = "The version of Kubernetes to use for the EKS cluster."
  type        = string
  default     = "1.26"

  validation {
    condition     = can(regex("^[0-9]+[.][0-9]+$", var.kubernetes_version))
    error_message = "Kubernetes version must be in the format of 'X.Y'."
  }
}

variable "cluster_enabled_log_types" {
  description = "A list of the desired control plane logging to enable."
  type        = list(string)
  default     = ["api", "audit", "authenticator", "controllerManager", "scheduler"]

  validation {
    condition     = alltrue([for log_type in var.cluster_enabled_log_types : contains(["api", "audit", "authenticator", "controllerManager", "scheduler"], log_type)])
    error_message = "Invalid log type specified. Valid values are: api, audit, authenticator, controllerManager, scheduler."
  }
}

variable "node_group_name" {
  description = "The name of the EKS node group."
  type        = string
  default     = "default"

  validation {
    condition     = can(regex("^[a-zA-Z][a-zA-Z0-9-]*$", var.node_group_name))
    error_message = "Node group name must start with a letter and can only contain letters, numbers, and hyphens."
  }
}

variable "tags" {
  description = "A map of tags to add to all resources."
  type        = map(string)
  default     = {}

  validation {
    condition     = alltrue([for key, value in var.tags : can(regex("^[\\w\\s-.:/@]+$", key)) && can(regex("^[\\w\\s-.:/@]+$", value))])
    error_message = "Tags must only contain alphanumeric characters, spaces, and the following special characters: -.:/@"
  }
}