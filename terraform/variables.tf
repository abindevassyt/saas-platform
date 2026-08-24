variable "aws_region" {
  description = "AWS deployment region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment (staging, production)"
  type        = string
  default     = "production"
}

variable "db_username" {
  description = "Master database user"
  type        = string
  default     = "saas_user"
}

variable "db_password" {
  description = "Master database password"
  type        = string
  sensitive   = true
}
