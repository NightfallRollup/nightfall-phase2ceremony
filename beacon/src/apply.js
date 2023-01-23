const { zKey } = require('snarkjs');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const chalk = require('chalk');

module.exports = async function applyContrib({ circuit, contribData, token, backendHost }) {
  const response = await axios({
    method: 'get',
    url: `${backendHost}/contribution/${circuit}`,
    responseType: 'arraybuffer',
  });

  fs.writeFileSync(`contrib_${circuit}.zkey`, response.data, { encoding: 'binary' });

  const res = await zKey.beacon(
    `contrib_${circuit}.zkey`,
    `beacon_${circuit}.zkey`,
    'beacon',
    contribData,
    10,
    console,
  );

  if (!res) throw Error('Invalid inputs');

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
  });

  console.log(chalk.green(`Applied beacon to circuit ${circuit}`));

  return call.data.verification;
};
