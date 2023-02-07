output "distribution_id" {
    description = "The frontend distribution id"
    value = aws_cloudfront_distribution.distribution.id
}

output "cluster_address" {
    description = "Memcached Cluster Address"
    value = aws_elasticache_cluster.nightfall-mpc-memcached.cluster_address
}