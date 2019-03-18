const argv = require('yargs').argv;

const argExit = error => {
  console.error('Error:', error);
  console.error('Required syntax is: yarn start --config <configpath> --csv <csvpath>');
  process.exit(1);
};

if (!argv.config) {
  argExit('Missing config file path argument... exiting...');
} else if (!argv.csv) {
  argExit('Missing csv file path argument... exiting...');
}

let config;

try {
  config = require(argv.config);
} catch (e) {
  console.error('Failed to import config file...');
  console.error(e.message, e.stack);
  process.exit(1);
}

if (config.disclaimer != 'true') {
  console.error('You must accept the disclaimer before running this software...');
  process.exit(1);
}

let input;

try {
  input = require('fs').readFileSync(argv.csv);
} catch (e) {
  console.error('Failed to import csv file...');
  console.error(e.message, e.stack);
  process.exit(1);
}

// Dependencies
const parse = require('csv-parse/lib/sync');
