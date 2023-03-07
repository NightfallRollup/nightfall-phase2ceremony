const { zKey } = require('snarkjs');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const chalk = require('chalk');

module.exports = async function applyContribution({ circuit, contribData, token, backendHost }) {

  console.log(`Downloading the lastest contribution`);

  const response = await axios({
    method: 'get',
    url: `${backendHost}/contribution/${circuit}?token=${token}`,
    responseType: 'arraybuffer',
    timeout: 300000
  });

  fs.writeFileSync(`contrib_${circuit}.zkey`, response.data, { encoding: 'binary' });

  console.log(`Generating beacon contribution...`);

  const res = await zKey.beacon(
    `contrib_${circuit}.zkey`,
    `beacon_${circuit}.zkey`,
    'beacon',
    contribData,
    10,
    console,
  );

  if (!res) throw Error('Invalid inputs');

  console.log(`Sending beacon contribution`);

  const formData = new FormData();
  const dataPath = path.join(__dirname, `../beacon_${circuit}.zkey`);

  formData.append('contribution', fs.createReadStream(dataPath));
  formData.append('circuit', circuit);
  formData.append('token', token);

  const call = await axios({
    method: 'POST',
    url: `${backendHost}/beacon`,
    data: formData,
    headers: { 'x-app-token': process.env.AUTH_KEY },
    timeout: 300000
  });

  console.log(chalk.green(`Applied beacon to circuit ${circuit}`));

  return call.data.verification;
};
