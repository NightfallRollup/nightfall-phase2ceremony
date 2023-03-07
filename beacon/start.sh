_CIRCUITS=""

for f in ../circuits/*.circom
do 
    _CIRCUITS="${_CIRCUITS}$(basename $f .circom),"
done

export CIRCUITS="${_CIRCUITS%?}"

npm run start $1 $2