#!/usr/bin/env node
/* eslint-disable prettier/prettier */
const { Command } = require('commander');
const program = new Command();
const promptly = require('promptly');
const applyContribution = require('./src/apply');
const chalk = require('chalk');
const axios = require('axios');

const CIRCUITS = process.env.CIRCUITS.split(',');

const BACKEND_HOST = process.env.BACKEND_HOST || 'https://api-ceremony.nightfall.io';

program.description('CLI').version('1.0.0');

program
  .description('Beacon')
  .argument('[beaconHash]', 'The beacon hash to apply')
  .argument('[circuit]', 'Apply beacon to a specific circuit only')
  .action(async (beaconHash, circuit) => {
    if (!beaconHash) beaconHash = await promptly.prompt('Beacon hash: ');

    if (circuit && ! CIRCUITS.includes(circuit)) {
      console.error(`Invalid circuit! Valid ones are: `, CIRCUITS);
      process.exit(1);
    }

    const circuits = circuit ? [circuit] : CIRCUITS;

    console.log('Backend host: ', BACKEND_HOST);
    console.log('Applying hash: ', beaconHash);
    console.log('Contributing to circuits: ', circuits);

    let token = process.env.TOKEN;
    if (! token) {
      const res = await axios({
        method: 'GET',
        url: `${BACKEND_HOST}/token`,
        timeout: 300000
      });

      if (! res.data.token) {
        console.error(`Sorry, it is not possible to contribute at the moment. Please, try again later!`);
        return;
      }

      token = res.data.token;
    }

    for (const circuit of circuits) {
      console.log('\n*** Generating contribution for circuit: ', circuit);

      await applyContribution({
        circuit,
        contribData: beaconHash,
        token,
        backendHost: BACKEND_HOST,
      });
    }

    console.log(chalk.bgGreen('\nThank you for your contribution!\n'));

    process.exit(0);
  });

program.parse();
