resource "aws_cloudwatch_log_group" "nightfall-mpc" {
  name = "nightfall-mpc"

  tags = {
    Environment = "production"
    Application = "nightfall-mpc"
  }
}