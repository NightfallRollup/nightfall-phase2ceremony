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

For the second release of Nightfall, the team decided upon three main priorities:
- Make the phase2 MPC easily orchestrated, with an MPC server that serves, verifies and receives the
  incoming contributions
- Make the contributions as easy as possible through a website that anyone can visit and contribute
  with 1 click

# How can I contribute

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
beacon
final contribution

# Application Structure
## Backend
Folder: `serve`. A NodeJS app that contains the logic for controlling the contributions.

## Frontend
Folder: `browser`. A React application containing the pages and scripts.

## Beacon
Folder: `beacon`. A command line application for generating the beacon. This is normally done after the contributions are finished.

## Infrastructure/Deployment
Folder: `terraform`. Contains the resources written in Terraform for allowing provisioning the infrastructure/application on AWS.

# Running locally

For running locally follow these steps:
1. At the project's root directory, run `./bin/init.sh` on the command line. This needs to be done only once!
  - This step installs some dependencies, generate files and uploads the initial zkey contribution files to the AWS S3 bucket. 
  If the zkey files were already uploaded before, just run the command. Otherwise you will have to configure your AWS credentials 
  (`$ aws configure`) before running it to guarantee they will be uploaded successfully. 
2. Running the backend app: open a terminal, change to the `serve` directory, export the AWS credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION=eu-west-3`. They are supposed to have read/write access to the S3 bucket where the contributions will be stored), build the app (`npm i`) and run `AUTH_KEY=[YOUR_AUTH_KEY] ./start.sh dev` (e.g. `$ AUTH_KEY=1068160e-7951-4c73-b247-15f00c62f259 ./start.sh dev`)
3. Running the frontend app: open a terminal, change to the `browser` directory, build the app (`npm i`) and run `./dev.sh`. This will make the initial 
page of the application to open in your browser.
4. Running the beacon app: open a terminal, change to the `beacon` directory, build the app (`npm i`) and run `BACKEND_HOST=[YOUR_BACKEND_HOST] AUTH_KEY=[THE_AUTH_KEY_USED_IN_BACKEND] npm run start` (e.g. `$ BACKEND_HOST=http://localhost:3333 AUTH_KEY=1068160e-7951-4c73-b247-15f00c62f259 npm run start`). One 
can pass via command line the circuit desired for applying the beacon - if nothing is passed, the beacon will be applied for all the circuits in place. The beacon 
hash is required, it must be an hexadecimal string and will be asked during the processing if not passed via command-line (e.g. `npm run start [beacon_hash] [circuit]`).

## Architecture

We make use of Terraform in order to manage the provisioning of AWS resources.
Under the `terraform` folder you can see the following:

- A VPC, subnets and internet gateway on `eu-west-3` are used
- An EC2 instance is created, together with a load balancer and target group. The script `server.sh`
  is passed into it, which clones this repo and starts the server you can find on the `serve`
  folder. An existent certificate is used on the load balancer listener. A route53 record is added
  to an existing Zone ID.
- A cloudfront distribution is also provisioned and set up with an existent certificate. Its record
  is also added to an existent Zone ID through route53.
- An S3 bucket is created

# How to deploy

As a requirement, you should have already configured:

- Some ACM certificates in AWS certificate manager
- A Route53 zoneID

You need to set up the following needed secrets in Github:

- `AUTH_KEY` - Some random string (it can be anything, really) to protect your beacon routes on the
  backend.
- `AWS_ACCESS_KEY_ID` - You need to provide an AWS access key for your own AWS environment, so
  github can invalidate your cloudfront cache
- `AWS_SECRET_ACCESS_KEY` - Same thing
- `TF_API_TOKEN` - The terraform cloud token, so the terraform process runs there

In terraform cloud, you need the following variables in "variable sets":

- `AWS_ACCESS_KEY_ID` - So terraform can deploy your infrastructure
- `AWS_SECRET_ACCESS_KEY` - Same
- `CERTIFICATE_ARN_BACKEND` - Same, for the main branch (like
  api-ceremony.nightfall.io)
- `CERTIFICATE_ARN_FRONTEND` - Same thing, for the main frontend branch (like
  ceremony.nightfall.io)
- `ROUTE_53_ZONE_ID` - The zone ID you want to use for your route53 records

Once these requirements are met, just clone this repo and add whatever circuits you need to run your
ceremony for on the `circuits` folder. Then, assuming your AWS account has enough permissions (the
CI/CD will tell you otherwise), you should be able to simply run `terraform deploy`.
