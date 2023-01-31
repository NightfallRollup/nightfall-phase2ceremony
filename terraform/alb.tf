
resource "aws_security_group" "nightfall-mpc" {
  vpc_id = aws_vpc.nightfall-mpc.id
  egress = [
    {
      cidr_blocks      = [ "0.0.0.0/0", ]
      description      = ""
      from_port        = 0
      ipv6_cidr_blocks = []
      prefix_list_ids  = []
      protocol         = "-1"
      security_groups  = []
      self             = false
      to_port          = 0
    }
  ]
 ingress                = [
   {
     cidr_blocks      = [ "0.0.0.0/0", ]
     description      = ""
     from_port        = 443
     ipv6_cidr_blocks = []
     prefix_list_ids  = []
     protocol         = "tcp"
     security_groups  = []
     self             = false
     to_port          = 443
   }
  ]

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    "Name" = "nightfall-mpc"
  }
}

resource "aws_lb" "lb" {
  name               = "nightfall-mpc-lb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.nightfall-mpc.id]
  subnets            = aws_subnet.public[*].id

  enable_deletion_protection = false

  tags = {
    "Name"      = "nightfall-mpc"
    Environment = "production"
  }
}

resource "aws_lb_target_group" "tg" {
  name     = "nightfall-mpc-lb-tg"
  port     = 3333
  protocol = "HTTP"
  protocol_version = "HTTP1"
  vpc_id   = aws_vpc.nightfall-mpc.id

  health_check {
    path = "/healthcheck"
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_lb_target_group_attachment" "tg-attachment" {
  count = length(var.public_subnets)
  target_group_arn = aws_lb_target_group.tg.arn
  target_id        = aws_instance.nightfall-mpc[count.index].id
  port             = 3333
}

resource "aws_lb_listener" "listener" {
  load_balancer_arn = aws_lb.lb.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = var.CERTIFICATE_ARN_BACKEND

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.tg.arn
  }
}
