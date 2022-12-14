#! /bin/bash
browserify public/apply.js -p esmify -o public/bundles.js 

CIRCUITS=""

for f in ../circuits/*.circom
do 
    CIRCUITS="${CIRCUITS}$(basename $f .circom),"
done

export REACT_APP_CIRCUITS="${CIRCUITS%?}"

npm run react-build
