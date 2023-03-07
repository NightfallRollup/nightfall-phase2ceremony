resource "aws_vpc" "nightfall-mpc" {
  cidr_block = var.cidr
  enable_dns_support = true
  enable_dns_hostnames = true

  tags = {
    Name = "Nightfall MPC"
  }
}

resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.nightfall-mpc.id
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.nightfall-mpc.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.gw.id
  }
}

resource "aws_route_table_association" "public-rta" {
  count          = length(var.public_subnets)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_subnet" "public" {
  count                   = length(var.public_subnets)
  vpc_id                  = aws_vpc.nightfall-mpc.id
  cidr_block              = var.public_subnets[count.index]
  availability_zone       = var.availability_zone[count.index]
  map_public_ip_on_launch = true
}
