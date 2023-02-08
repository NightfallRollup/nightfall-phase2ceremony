resource "aws_security_group" "nightfall-mpc-sg-memcached" {
  vpc_id = aws_vpc.nightfall-mpc.id
  name   = "nightfall-mpc-sg-memcached"
  ingress                = [
   {
     cidr_blocks      = [ "0.0.0.0/0", ]
     description      = ""
     from_port        = 11211
     ipv6_cidr_blocks = []
     prefix_list_ids  = []
     protocol         = "tcp"
     security_groups  = []
     self             = false
     to_port          = 11211
   }
  ]

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    "Name" = "nightfall-mpc-memcached"
  }
}

resource "aws_elasticache_subnet_group" "nightfall-mpc" {
  name       = "nightfall-mpc"
  subnet_ids = [ aws_subnet.public[0].id, aws_subnet.public[1].id ]
}

resource "aws_elasticache_cluster" "nightfall-mpc-memcached" {
  cluster_id           = "nightfall-mpc"
  engine               = "memcached"
  node_type            = "cache.t2.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.memcached1.6"
  port                 = 11211
  subnet_group_name    = aws_elasticache_subnet_group.nightfall-mpc.name
  availability_zone    = var.availability_zone[0]
  security_group_ids   = [ aws_security_group.nightfall-mpc-sg-memcached.id ]
}