# This file installs necessary dependencies, downloads the Power of Tau from Hermez to $PROJECT_ROOT/circuits
# and generates the initial contribution (*0000.zkey file) for each circuit under the $PROJECT_ROOT/circuits.

echo "Installing NPM dependencies"
npm i -g snarkjs
npm i -g browserify

echo "Downloading Hermez Power Of Tau"
wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_16.ptau -O circuits/phase1.ptau

echo "Installing s3cmd"
sudo apt-get install s3cmd

npm i

echo "Generating r1cs files, initial contribution zkeys & uploading zkeys to s3 bucket"
for f in ./circuits/*.circom
do 
  circom --r1cs $f -o ./circuits
  snarkjs groth16 setup ${f%.circom}.r1cs circuits/phase1.ptau ${f%.circom}_0000.zkey

  BASENAME=$(basename $f .circom)
  FOLDERNAME=${BASENAME%.*}
  s3cmd sync circuits/${BASENAME}_0000.zkey s3://nightfall-mpc/$FOLDERNAME/${BASENAME}_0000.zkey
done
