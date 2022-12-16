# Nightfall MPC Ceremony

Zero-knowledge proofs require a trusted setup. This setup generates a so-called "toxic waste" which
could potentially allow to create fake proofs. To avoid this, one or two ceremonies needs to be held
where this setup is generated via multi-party computation (MPC).

When using the groth16 proving scheme, a two-phase ceremony needs to be held:

- Phase1, which is done for all circuits
- Phase2, which is applied to a specific circuit only\

For phase1, as it's done for all circuits, Nightfall uses the Hermez Phase1 Ceremony and its files.
You can know more on the
[Hermez blog post about it](https://blog.hermez.io/hermez-cryptographic-setup/).

As a preparation for phase2 of the ceremony, which is coordinated on this repo, we downloaded the
2^20 file from Hermez Phase1 ceremony. We then applied the
[snarkjs setup phase](https://github.com/iden3/snarkjs#15-setup) for each circuit:

```
snarkjs groth16 setup <circuit>.r1cs pot20_final.ptau <circuit>_0000.zkey
```

Which gave us the first `.zkey` file with 0 contributions. This is the file you will find inside the
`circuits` folder on this repo. If you ever write or modify one of the circuits, you need to do this
again, and run the ceremony for that circuit only.

# Nightfall3 MPC ceremony (phase 2)

For the second release of Nightfall, the team decided upon three main priorities:

- Make the phase2 MPC easily orchestrated, with an MPC server that serves, verifies and receives the
  incoming contributions
- Make this infrastructure easy to deploy and manually test, following the principles of
  Infrastructure as Code and GitOps
- Make the contributions as easy as possible through a website that anyone can visit and contribute
  with 1 click

# How can I contribute

If you simply want to contribute to the ceremony, just visit the live page at
`ceremony.polygon-nightfall.io` and follow the instructions. It will take just a few minutes. If you
want to know more, follow along.

## Architecture

We make use of Terraform and Terraform Cloud in order to manage the provisioning of AWS resources.
Under the `terraform` folder you can see the following:

- A VPC, subnets and internet gateway on `eu-west-3` are used
- An EC2 instance is created, together with a load balancer and target group. The script `server.sh`
  is passed into it, which clones this repo and starts the server you can find on the `serve`
  folder. An existent certificate is used on the load balancer listener. A route53 record is added
  to an existing Zone ID.
- A cloudfront distribution is also provisioned and set up with an existent certificate. Its record
  is also added to an existent Zone ID through route53.
- An S3 bucket is created

These services are used with branch names thanks to Github Actions. Each new `pull_request` creates
new resources, so manual testing can be performed on these branches without messing up with the
ongoing `mpc` in `main`.

## Github actions

As mentioned, Github Actions is the CI/CD pipeline that will do the following:

- Deploy or update the infrastructure everytime there's a new `pull_request`, or a new `commit` on
  an open `pull_request`
- Copy the first contribution of each circuit into the S3 bucket
- Build the `react` frontend and copy the static page to the S3 bucket
- Invalidate the cloudfront cache

# How can I run a ceremony

As a requirement, you should have already configured:

- Some ACM certificates in AWS certificate manager
- A Route53 zoneID

You need to set up the following needed secrets in Github:

- `AUTH_KEY` - Some random string (it can be anything, really) to protect your beacon routes on the
  backend. This is a work in progress.
- `AWS_ACCESS_KEY_ID` - You need to provide an AWS access key for your own AWS environment, so
  github can invalidate your cloudfront cache
- `AWS_SECRET_ACCESS_KEY` - Same thing
- `TF_API_TOKEN` - The terraform cloud token, so the terraform process runs there

In terraform cloud, you need the following variables in "variable sets":

- `AWS_ACCESS_KEY_ID` - So terraform can deploy your infrastructure
- `AWS_SECRET_ACCESS_KEY` - Same
- `CERTIFICATE_ARN_BACKEND_DEV` - The certificate ARN of your backend certificate, for the
  development branches (like api-<your-branch-name>.ceremony.polygon-nightfall.io)
- `CERTIFICATE_ARN_BACKEND_MAIN` - Same, for the main branch (like
  api-ceremony.polygon-nightfall.io)
- `CERTIFICATE_ARN_FRONTEND_DEV` - Same thing, for frontend (like
  <your-branch-name>.ceremony.polygon-nightfall.io)
- `CERTIFICATE_ARN_FRONTEND_MAIN` - Same thing, for the main frontend branch (like
  ceremony.polygon-nightfall.io)
- `ROUTE_53_ZONE_ID` - The zone ID you want to use for your route53 records

Once these requirements are met, just clone this repo and add whatever circuits you need to run your
ceremony for on the `circuits` folder. Then, assuming your AWS account has enough permissions (the
CI/CD will tell you otherwise), you should be able to simply run `terraform deploy`.

# TODO

- Make a ticketing system to allow people to report they're contributing, and allow others to wait
  (as contributions need to be synchronous)
- Have proper unit and e2e testing
