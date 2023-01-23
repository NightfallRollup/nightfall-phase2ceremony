#!/usr/bin/env node
/* eslint-disable prettier/prettier */
const { Command } = require('commander');
const program = new Command();
const promptly = require('promptly');
const applyContrib = require('./src/apply');
const chalk = require('chalk');
const axios = require('axios');
let circuits = ['deposit', 'burn', 'tokenise', 'transfer', 'withdraw', 'depositfee'];

const BACKEND_HOST = process.env.BACKEND_HOST || 'https://api-ceremony.polygon-nightfall.io';

program.description('CLI').version('0.8.0');

program
  .description('Beacon')
  .argument('[beaconHash]', 'The beacon hash to apply')
  .argument('[circuit]', 'Apply beacon to a specific circuit only')
  .action(async (beaconHash, circuit) => {
    if (!beaconHash) beaconHash = await promptly.prompt('Beacon hash: ');

    if (circuit && circuits.find(el => el === circuit)) circuits = [circuit];

    console.log('Applying hash', beaconHash);
    console.log('Contributing to circuits:', circuits);

    const res = await axios({
      method: 'GET',
      url: `${BACKEND_HOST}/token`,
    });

    if (! res.data.token) {
      console.error(`Sorry, it is not possible to contribute at the moment. Please, try again later!`);
      return;
    }

    const token = res.data.token;

    for (const circuit of circuits) {
      await applyContrib({
        circuit,
        contribData: beaconHash,
        token,
        BACKEND_HOST,
      });
    }

    console.log(chalk.bgGreen('Thank you for your contribution!'));

    process.exit(0);
  });

program.parse();
