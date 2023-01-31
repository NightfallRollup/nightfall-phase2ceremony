terraform {
  backend "remote" {
    organization = "israelboudoux"

    workspaces {
      prefix = "nightfall-mpc"
    }
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }
  }

  required_version = ">= 1.2.0"
}
