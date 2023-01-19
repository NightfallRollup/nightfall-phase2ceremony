# Sets the default env variables to be used by the applications

# sets the CIRCUITS env var
CIRCUITS_=""
for f in ./circuits/*.circom
do 
    CIRCUITS_="${CIRCUITS_}$(basename $f .circom),"
done

echo $CIRCUITS_

export CIRCUITS="${CIRCUITS_%?}"
