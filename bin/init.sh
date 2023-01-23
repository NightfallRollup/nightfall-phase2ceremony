npm i -g snarkjs
npm i -g browserify

echo "Downloading Hermez Power Of Tau"
wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_16.ptau -O circuits/phase1.ptau

echo "Generating r1cs files and the very first zkey file for each circuit"
for f in ./circuits/*.circom
do 
  circom --r1cs $f -o ./circuits
  snarkjs groth16 setup ${f%.circom}.r1cs circuits/phase1.ptau ${f%.circom}_0000.zkey

  # TODO remove this?
  #BASENAME=$(basename $f .circom)
  #FOLDERNAME=${BASENAME%.*}
  #s3cmd sync circuits/${BASENAME}_0000.zkey s3://mpc-main/$FOLDERNAME/${BASENAME}_0000.zkey
done
