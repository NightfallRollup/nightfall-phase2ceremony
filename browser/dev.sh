#! /bin/bash
browserify public/apply.js -p esmify -o public/bundles.js 

CIRCUITS=""

for f in ../circuits/*.circom
do 
    CIRCUITS="${CIRCUITS}$(basename $f .circom),"
done

if [ -z "${REACT_APP_HOST_BACKEND}" ]; then
    export REACT_APP_HOST_BACKEND='http://localhost:3333'
fi

export REACT_APP_CIRCUITS="${CIRCUITS%?}"

npm run react-dev
