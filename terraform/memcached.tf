resource "aws_elasticache_cluster" "nightfall-mpc-memcached" {
  cluster_id           = "nightfall-mpc"
  engine               = "memcached"
  node_type            = "cache.t2.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.memcached1.6"
  port                 = 11211
}