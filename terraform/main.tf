# Terraform Infrastructure as Code for Multi-Tenant SaaS Platform

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# VPC Configuration
resource "aws_vpc" "saas_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "saas-platform-vpc"
    Environment = var.environment
  }
}

# Managed PostgreSQL RDS Instance
resource "aws_db_instance" "postgres" {
  allocated_storage       = 20
  max_allocated_storage   = 100
  engine                  = "postgres"
  engine_version          = "16.1"
  instance_class          = "db.t4g.micro"
  db_name                 = "saas_platform_db"
  username                = var.db_username
  password                = var.db_password
  skip_final_snapshot     = true
  multi_az                = var.environment == "production" ? true : false
  publicly_accessible     = false

  tags = {
    Name        = "saas-postgres-rds"
    Environment = var.environment
  }
}

# ElastiCache Redis Cluster
resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "saas-redis-cluster"
  engine               = "redis"
  node_type            = "cache.t4g.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379

  tags = {
    Name        = "saas-redis-cache"
    Environment = var.environment
  }
}

# ECS Cluster for Containerized Services
resource "aws_ecs_cluster" "saas_cluster" {
  name = "saas-platform-ecs-cluster"

  tags = {
    Environment = var.environment
  }
}
