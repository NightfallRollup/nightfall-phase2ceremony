
resource "aws_security_group" "nightfall-mpc-backend" {
  vpc_id = aws_vpc.nightfall-mpc.id
  name   = "nightfall-mpc-sg-backend"
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
     from_port        = 22
     ipv6_cidr_blocks = []
     prefix_list_ids  = []
     protocol         = "tcp"
     security_groups  = []
     self             = false
     to_port          = 22
   },
   {
     cidr_blocks      = [ "0.0.0.0/0", ]
     description      = ""
     from_port        = 3333
     ipv6_cidr_blocks = []
     prefix_list_ids  = []
     protocol         = "tcp"
     security_groups  = []
     self             = false
     to_port          = 3333
    }
  ]
}

resource "aws_instance" "nightfall-mpc" {
  count         = length(var.public_subnets)
  ami           = "ami-0afd55c0c8a52973a"
  instance_type = "m6i.xlarge"
  user_data_base64 = base64encode("${templatefile("server.sh", {
      git_branch                = var.GIT_BRANCH
      s3_access_key_secret      = var.S3_AWS_SECRET_ACCESS_KEY
      s3_access_key_id          = var.S3_AWS_ACCESS_KEY_ID
      auth_key                  = var.AUTH_KEY
      memcached_cluster_address = "${aws_elasticache_cluster.nightfall-mpc-memcached.cluster_address}"
  })}")
  user_data_replace_on_change = true
  key_name                    = "ssh" # Remove if not needed!
  vpc_security_group_ids      = [ aws_security_group.nightfall-mpc-backend.id ]
  depends_on                  = [ aws_security_group.nightfall-mpc-backend ]
  associate_public_ip_address = true
  subnet_id                   = aws_subnet.public[count.index].id

  tags = {
    "Name" = "nightfall-mpc"
  }
}
