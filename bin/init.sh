# This file installs necessary dependencies, downloads the Power of Tau from Hermez to $PROJECT_ROOT/circuits
# and generates the initial contribution (*0000.zkey file) for each circuit under the $PROJECT_ROOT/circuits.

echo "Installing NPM dependencies"
npm i -g snarkjs
npm i -g browserify

echo "Downloading Hermez Power Of Tau"
wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_16.ptau -O circuits/phase1.ptau

npm i

echo "Generating r1cs files"
for f in ./circuits/*.circom
do
  circom --r1cs $f -o ./circuits
done
