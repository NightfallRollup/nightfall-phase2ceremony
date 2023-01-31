# Route53 resource
resource "aws_route53_zone" "nightfall-mpc" {
  name = "nightfall.io"
}

resource "aws_route53_record" "nightfall-mpc-ns" {
  allow_overwrite = true
  name            = "nightfall.io"
  ttl             = 172800
  type            = "NS"
  zone_id         = aws_route53_zone.nightfall-mpc.zone_id

  records = [
    aws_route53_zone.nightfall-mpc.name_servers[0],
    aws_route53_zone.nightfall-mpc.name_servers[1],
    aws_route53_zone.nightfall-mpc.name_servers[2],
    aws_route53_zone.nightfall-mpc.name_servers[3],
  ]
}

resource "aws_route53_record" "nightfall-mpc-api" {
  zone_id = aws_route53_zone.nightfall-mpc.zone_id
  name    = "api-ceremony.nightfall.io"
  type    = "A"

  alias {
    name = aws_lb.lb.dns_name
    zone_id = aws_lb.lb.zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "nightfall-mpc-frontend" {
  zone_id = aws_route53_zone.nightfall-mpc.zone_id
  name    = "ceremony.nightfall.io"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.distribution.domain_name
    zone_id                = aws_cloudfront_distribution.distribution.hosted_zone_id
    evaluate_target_health = false
  }
}
