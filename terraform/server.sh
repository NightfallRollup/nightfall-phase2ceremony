#!/bin/bash
export AWS_ACCESS_KEY_ID=${access_key_id}
export AWS_SECRET_ACCESS_KEY=${access_key_secret}

## Installing nvm
curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash 
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm

## Cloning Nightfall repo and installing the NPM version used
git clone -b ${git_branch} https://github.com/NightfallRollup/phase2ceremony.git
echo "Commit hash ${commit_hash}"

cd phase2ceremony
# Installing circom dependencies
apt-get update
apt install build-essential
curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh -s -- -y

# Installing circom
git clone https://github.com/iden3/circom.git
cd circom
$HOME/.cargo/bin/cargo build --release
$HOME/.cargo/bin/cargo install --path circom
cd ..

# Installing circomlib
nvm install v16.17.0
nvm use v16.17.0
npm i

# Compiling circuits
for f in ./circuits/*.circom; do circom --r1cs $f -o ./circuits; done

# Getting Hermez's phase1 .ptau files
wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_16.ptau -O circuits/phase1.ptau

# Moar dependencies...
cd serve
npm i

## Starting app like a boss
AUTH_KEY=${auth_key} npm run start
