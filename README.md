# Nightfall MPC Ceremony
Zero-knowledge proofs require a trusted setup and one or two ceremonies need to be held where this setup is generated via multi-party computation (MPC).

When using the SNARK, a two-phase ceremony needs to be held to increase the security and preventing faking proof of being generated:
- Phase1, which is done for all circuits
- Phase2, which is applied to a specific circuit only

For Phase1, as it's done for all circuits, Nightfall uses the Hermez Phase1 Ceremony and its files.
You can know more on the
[Hermez blog post about it](https://blog.hermez.io/hermez-cryptographic-setup/).

As a preparation for Phase2 of the ceremony, which is coordinated on this repo, we downloaded the
2^20 file from Hermez Phase1 ceremony. We then applied the
[snarkjs setup phase](https://github.com/iden3/snarkjs#15-setup) for each circuit:

```
snarkjs groth16 setup <circuit>.r1cs pot20_final.ptau <circuit>_0000.zkey
```

Which gave us the first `.zkey` file with 0 contributions. This is the file you will find inside the
`circuits` folder on this repo. If you ever write or modify one of the circuits, you need to do this
again, and run the Phase2 ceremony for that circuit only.


# Nightfall3 MPC ceremony (phase 2)
With this application, the following goals are achieved:
- Easily orchestration of phase2 MPC, with an MPC server that serves, verifies and receives the
  incoming contributions
- Contributions are made as easy as possible through a website that anyone can visit and contribute
  with 1 click


# Application structure
## Frontend
Folder: `browser`. A React application containing the pages and scripts.

## Backend
Folder: `serve`. A NodeJS app that contains the logic for controlling the contributions.

## Beacon
Folder: `beacon`. A command line application for generating the beacon & verification keys for the circuits. This should done after the user contributions are finished.

## Deployment
Folder: `terraform`. Contains the resources written in Terraform for allowing provisioning the infrastructure/application on AWS.


# Infrastructure
The following resources are needed for supporting the application on AWS:
- A VPC, subnets and internet gateway on the desired region
- Certificates for both, the backend and frontend apps
- Route53 records along with a Zone ID. Routes records for both the backend & frontend apps are needed
- An EC2 instance, together with a load balancer and target group
- A Cloudfront distribution is also provisioned
- A S3 bucket: it is used for storing the contributions. It is private and the application needs access to credentials with read/write permissions.
- A CloudWatch log group
- A Elastic Cluster Memcached instance


# Environment variables
Follow the environment variables used by the application:
- `AUTH_KEY` - Some random string (it can be anything, really) to protect your beacon route on the backend.
- `BACKEND_HOST` - The URL of the backend host (e.g. http://localhost:3333)
- `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` - are used in the following cases:
  1. When running locally: these credentials are needed for the backend app to access the s3 bucket only
  2. When deploying: if the current approach for infrastructure provisioning is used, these credentials need proper permissions
  for finishing the process successfully.
  

# Running locally
For running locally follow these steps:
1. At the project's root directory, run `./bin/init.sh` on the command line. This needs to be done only once!
    - This step installs some dependencies and generates the R1CS files.
2. Running the backend app: open a terminal, change to the `serve` directory, export the AWS credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION=eu-west-3`. They are supposed to have read/write access to the S3 bucket where the contributions will be stored), build the app (`npm i`) and run `AUTH_KEY=[YOUR_AUTH_KEY] ./start.sh dev` (e.g. `$ AUTH_KEY=1068160e-7951-4c73-b247-15f00c62f259 ./start.sh dev`)
3. Running the frontend app: open a terminal, change to the `browser` directory, build the app (`npm i`) and run `./dev.sh`. This will make the initial page of the application to open in your browser.
4. Running the beacon app: open a terminal, change to the `beacon` directory, build the app (`npm i`) and run `BACKEND_HOST=[YOUR_BACKEND_HOST] AUTH_KEY=[THE_AUTH_KEY_USED_IN_BACKEND] ./start.sh` (e.g. `$ BACKEND_HOST=http://localhost:3333 AUTH_KEY=1068160e-7951-4c73-b247-15f00c62f259 ./start.sh`). One 
can pass via command line the circuit desired for applying the beacon - if nothing is passed, the beacon will be applied for all the circuits in place. The beacon hash is required, it must be an hexadecimal string and will be asked during the processing.


# User contribution
If you simply want to contribute to the ceremony, one needs to visit the live page and follow the instructions. 
It will take just a few minutes and during this time the computer cannot be suspended/turned off, and  the internet
connection should be stable for things to work as expected.

Contributions are serial and are applied incrementally. Every new contribution picks the previous one and generates a new 
zkey file containing the most recent contribution. While someone is contributing, everyone else wishing to contribute should wait 
until the current contribution is done. This is done automatically and the system will control this letting you know 
when someone is contributing (when you click on the button `Let's do it!` on the main page).

Steps for contributing:
1. At the main page, click on the button `Let's do it!`, if anyone is contributing at the moment, you will
be allowed to contribute. Just move the mouse to generate an entropy for being used in the contribution (the pointer 
position moving in the screen is a good source of random data);
2. After the system finished the entropy generation, you will be asked to enter a name for your contribution - only 
alphanumeric characteres are allowed. Thsi field is not required, you can just go ahead by clicking on the `Contribute` 
button;
3. Then now it is just wait until the message `Thank you for your contribution!` shows up, and the contribution is done!


# Finishing contribution
After the user's contribution is finalized, a beacon contribution is necessary which formalizes the ending of contributions. This is done by running the `beacon` application locally (See the `Running locally` section, Item 4.)


# How to deploy
We make use of Terraform in order to manage the provisioning of AWS resources. Follow the instructions to deploy the application on AWS:
1. Instal the AWS CLI tool
2. Install the tool `s3cmd` (e.g. `apt-get install s3cmd`)
3. Install Terraform - (Instructions [here](https://developer.hashicorp.com/terraform/tutorials/aws-get-started/install-cli))
4. Open a terminal session, on the root of the project, change to the directory `terraform`
5. Issue the command `terraform login`. After confirming with `Yes`, this will take you to [Terraform Cloud](https://app.terraform.io/) for creating a new token. Paste it on the terminal so that the process can continue
6. Change the organization name in `terraform.tf` (`organization = "my org"`) to point to your organization (the one created in `Terraform Cloud`)
7. Change the values of the variables in the file `terraform.tfvars` accordingly
    - Before running the deployment, the `Route53` entries and `Certificates` (Amazon Certificate Manager) should be created beforehand because this cannot be automated when using an Amazon issued certificate since it requires a DNS or Email validation which should be requested manually.
8. Run the following commands on a terminal session:
    1. `terraform workspace new nightfall-mpc`
    2. `terraform init`
    3. `terraform validate`
        - This will verify if the TF resources looks good
    4. `terraform apply` 
        - This will apply the resources on your AWS account. One can run `terraform plan` to see the changes that are going to be applied. If something went wrong and you want to rollback the changes, run `terraform destroy`;
        - If for some reason the deployment failed somewhere, one can fix the issues and reply the apply command so that it will create/change only the non-existing resources.
    5. Once finished this process, you will have to fix the records for the backend and frontend in R53 via AWS Console to point to the right values
    6. This whole process rarely needs to be repeated. If some infra stuff has changed just run `terraform apply`.
9. Build and deploy the Frontend app:
    1. On a terminal session, change to the directory `browser`
    2. Issue the command `BACKEND_HOST=[BACKEND_HOST_ADDRESS] ./build.sh`
    4. Upload the contents to S3: `s3cmd sync --no-mime-magic --guess-mime-type build/* s3://nightfall-mpc/website/`
    3. Invalidate Cloudfront cache. You need to get the Cloudfront ID (see on AWS console): `aws cloudfront create-invalidation --distribution-id [CLOUDFRONT_ID] --paths "/*";`. You don't need to do this if it is the first time, this is only necessary when the Frontent app changes;
10. On the terminal, run the command `./bin/upload-initial-zkeys.sh`. You will have to configure your AWS credentials (`$ aws configure`) before running it to guarantee they will be uploaded successfully
11. The Backend app might take some time to go up. One can verify by hitting the `/healthcheck` endpoint.