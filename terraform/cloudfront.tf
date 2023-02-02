
resource "aws_cloudfront_origin_access_control" "distribution" {
  name                              = "nightfall-mpc"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_origin_access_identity" "distribution" {
  comment = "nightfall-mpc"
}

resource "aws_cloudfront_distribution" "distribution" {
  origin {
    domain_name              = aws_s3_bucket.nightfall-mpc.bucket_regional_domain_name
    origin_id                = aws_s3_bucket.nightfall-mpc.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.distribution.id
    origin_path = "/website"
  }

  default_root_object = "index.html"
  enabled             = true
  is_ipv6_enabled     = true
  aliases = [ var.FRONTEND_DOMAIN ]

  default_cache_behavior {
    compress = false
    viewer_protocol_policy = "allow-all"
    allowed_methods  = ["HEAD", "DELETE", "POST", "GET", "OPTIONS", "PUT", "PATCH"]
    cached_methods   = ["GET", "HEAD"]
    cache_policy_id = "658327ea-f89d-4fab-a63d-7e88639e58f6" // default policy id
    origin_request_policy_id = "88a5eaf4-2fd4-4709-b370-b4c650ea3fcf" // default policy id
    response_headers_policy_id = "5cc3b908-e619-4b99-88e5-2cf7f45965bd" // default policy id
    target_origin_id = aws_s3_bucket.nightfall-mpc.bucket_regional_domain_name
  }

  viewer_certificate {
    acm_certificate_arn = var.CERTIFICATE_ARN_FRONTEND
    ssl_support_method = "sni-only"
  }

  restrictions {
      geo_restriction {
          locations = []
          restriction_type = "none"
      }
  }
}
