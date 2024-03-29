const { zKey } = require('snarkjs');
const axios = require('axios').default;
const FormData = require('form-data');

/**
 * Generates the contribution for a given circuit and submits it
 */
async function generateContribution({ circuit, name, contribData, token, backendServer }) {
  const url = `${backendServer}/contribution`;

  const o = {
    type: 'mem',
    data: null,
    fileName: `contribution_${circuit}.zkey`,
  };

  // generates the contribution for the circuit
  const contributionHash = await zKey.contribute(`${url}/${circuit}?token=${token}`, o, name, contribData, console);

  o.file = o.data.buffer.slice(o.data.byteOffset, o.data.byteLength + o.data.byteOffset);

  const formData = new FormData();

  formData.append('contribution', new Blob([o.file]));
  formData.append('name', name);
  formData.append('circuit', circuit);
  formData.append('token', token);

  try {
    // submits the contribution
    await axios({
      method: 'POST',
      url: `${url}`,
      data: formData,
      timeout: 300000
    });
    return contributionHash;
  } catch (error) {
    console.log(error);
    return null;
  }
}

window.generateContrib = generateContribution;
