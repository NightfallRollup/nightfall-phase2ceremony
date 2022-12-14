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
curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh -s -- -y
source "$HOME/.cargo/env"
git clone https://github.com/iden3/circom.git
cd circom
cargo build --release
cargo install --path circom
cd ..

for f in ./circuits/*.circom; do circom --r1cs $f -o ./circuits; done
wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_16.ptau -O circuits/phase1.ptau

cd serve
nvm install
nvm use

## Dependencies...
npm i

## Starting app like a boss
AUTH_KEY=${auth_key} npm run start
