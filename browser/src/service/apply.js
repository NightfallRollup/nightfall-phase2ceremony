const snarkjs = require('./snarkjs.min.js');
//const { zKey } = require('snarkjs');
const axios = require('axios').default;
const FormData = require('form-data');

/**
 * Generates the contribution for a given circuit and submits it
 */
async function generateContrib({ circuit, name, contribData, branch, NODE_ENV }) {
  let url;
  if (NODE_ENV === 'development') {
    url = 'http://localhost:3333/contribution';
  } else if (branch !== 'main') {
    url = `https://api-${branch}.ceremony.polygon-nightfall.io/contribution`;
  } else {
    url = 'https://api-ceremony.polygon-nightfall.io/contribution';
  }

  const o = {
    type: 'mem',
    data: null,
    fileName: `contribution_${circuit}.zkey`,
  };

  // generates the contribution for the circuit
  //const res = await zKey.contribute(`${url}/${circuit}`, o, name, contribData);
  const res = await snarkjs.zKey.contribute(`${url}/${circuit}`, o, name, contribData);
  if (!res) throw Error('Invalid inputs');

  o.file = o.data.buffer.slice(o.data.byteOffset, o.data.byteLength + o.data.byteOffset);

  const formData = new FormData();
  formData.append('contribution', new Blob([o.file]));
  formData.append('name', name);
  formData.append('circuit', circuit);

  // submits the contribution
  const call = await axios({
    method: 'POST',
    url: `${url}`,
    data: formData,
  });

  return call.data.verification;
}

export { generateContrib };
