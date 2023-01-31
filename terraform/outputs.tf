output "distribution_id" {
    description = "The frontend distribution id"
    value = aws_cloudfront_distribution.distribution.id
}
