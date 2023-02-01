# The AWS region where the applications will be deployed
REGION = "eu-west-3"

# The availability zones one wish to deply the applications to
availability_zone = [ "eu-west-3a", "eu-west-3b" ]

# Sets the authentication key. This can be any string
AUTH_KEY = "1068160e-7951-4c73-b247-15f00c62f259"

# Certificate ARN for the backend app - A certificate should be created on Amazon Certificate Manager (ACM) using the desired domain
CERTIFICATE_ARN_BACKEND = "arn:aws:acm:eu-west-3:950711068211:certificate/d688c40c-5f25-4b89-9f8b-8c3bdf85ba15"

# Certificate ARN for the frontend app - A certificate should be created on Amazon Certificate Manager (ACM) using the desired domain on region 'us-east-1' as required by Cloudfront
CERTIFICATE_ARN_FRONTEND = "arn:aws:acm:us-east-1:950711068211:certificate/6dc01a09-9be1-438d-8d50-300edf33249f"

# The R53 zone id to be used in Cloudfront
ROUTE_53_ZONE_ID = "Z05413741GQORWY8FTPNF"

# The domain the frontend application will respond. Should match with the domain set in the certificate for the frontend app (CERTIFICATE_ARN_FRONTEND)
FRONTEND_DOMAIN = "ceremony.polygon-nightfall.io"

# The domain the backend application will respond. Should match with the domain set in the certificate for the frontend app (CERTIFICATE_ARN_BACKEND)
BACKEND_DOMAIN = "api-ceremony.polygon-nightfall.io"
# The https address of the backend host. Should match with the domain set in the certificate for the frontend app (CERTIFICATE_ARN_BACKEND)
BACKEND_HOST = "https://api-ceremony.polygon-nightfall.io"

# AWS credentials with read/write permission to the S3 bucket
S3_AWS_ACCESS_KEY_ID = ""
S3_AWS_SECRET_ACCESS_KEY = ""

# Credentials for applying changes on AWS
AWS_ACCESS_KEY_ID = ""
AWS_SECRET_ACCESS_KEY = ""
