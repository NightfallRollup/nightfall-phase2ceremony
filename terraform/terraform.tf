terraform {
  backend "remote" {
    organization = "my org here"

    workspaces {
      prefix = "nightfall-mpc"
    }
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.52.0"
    }
  }

  required_version = ">= 1.2.0"
}
