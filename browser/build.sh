#! /bin/bash

if [ -z "${BACKEND_HOST}" ]; then
    echo "Please, set the BACKEND_HOST environment variable!"
    exit 1
fi

# Running browserify to bundle some of the stuff in the "static" folder
browserify public/apply.js -p esmify -o public/bundles.js 

# We need to get an array of circuits as an environment variable for React
# So we loop through all files in ../circuits/, strip their extension, concatenate them
CIRCUITS=""
for f in ../circuits/*.circom
do 
    CIRCUITS="${CIRCUITS}$(basename $f .circom),"
done

export REACT_APP_BACKEND_HOST="${BACKEND_HOST}"

# And export as an env that React can read
export REACT_APP_CIRCUITS="${CIRCUITS%?}"

# Then we run the usual build
npm run react-build
