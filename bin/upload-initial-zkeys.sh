echo "Generating R1CS files, initial contribution zkeys & uploading zkeys to s3 bucket"
for f in ./circuits/*.circom
do
  circom --r1cs $f -o ./circuits
  snarkjs groth16 setup ${f%.circom}.r1cs circuits/phase1.ptau ${f%.circom}_0000.zkey

  BASENAME=$(basename $f .circom)
  s3cmd sync circuits/${BASENAME}_0000.zkey s3://nightfall-mpc/$BASENAME/${BASENAME}_0000.zkey
done