# Branch name
GIT_BRANCH = "main"

# The AWS region where the applications will be deployed
REGION = "eu-west-3"

# The availability zones one wish to deply the applications to
availability_zone = [ "eu-west-3a", "eu-west-3b" ]

# Sets the authentication key. This can be any string
AUTH_KEY = "1068160e-7951-4c73-b247-15f00c62f259"

# Certificate ARN for the backend app - A certificate should be created on Amazon Certificate Manager (ACM) using the desired domain
CERTIFICATE_ARN_BACKEND = ""

# Certificate ARN for the frontend app - A certificate should be created on Amazon Certificate Manager (ACM) using the desired domain on region 'us-east-1' as required by Cloudfront
CERTIFICATE_ARN_FRONTEND = ""

# The R53 zone id to be used in Cloudfront
ROUTE_53_ZONE_ID = ""

# The domain the frontend application will respond. Should match with the domain set in the certificate for the frontend app (CERTIFICATE_ARN_FRONTEND)
FRONTEND_DOMAIN = "ceremony.nightfall.io"

# The domain the backend application will respond. Should match with the domain set in the certificate for the frontend app (CERTIFICATE_ARN_BACKEND)
BACKEND_DOMAIN = "api-ceremony.nightfall.io"
# The https address of the backend host. Should match with the domain set in the certificate for the frontend app (CERTIFICATE_ARN_BACKEND)
BACKEND_HOST = "https://api-ceremony.nightfall.io"

# AWS credentials with read/write permission to the S3 bucket
S3_AWS_ACCESS_KEY_ID = ""
S3_AWS_SECRET_ACCESS_KEY = ""

# Credentials for applying changes on AWS
AWS_ACCESS_KEY_ID = ""
AWS_SECRET_ACCESS_KEY = ""
