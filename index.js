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

const records = parse(input, {
  columns: true,
  skip_empty_lines: true,
});

const processAccount = async record => {
  console.log('Processing', record.address, 'for amount of', record.amount);
};

const run = async () => {
  // console.log(records);
  // console.log(records.length);

  let accounts = {};

  let sum = 0;
  let duplicateSum = 0;
  for (let i = 0; i < records.length; i++) {
    sum += Number(records[i].amount);
    if (!accounts[records[i].address]) {
      accounts[records[i].address] = true;
      duplicateSum += Number(records[i].amount);
      await processAccount(records[i]);
    }
  }

  console.log('Total Addresses:', records.length);
  console.log('Total Amount:', sum);
  console.log('Total Addresses After Duplciate Removal:', Object.keys(accounts).length);
  console.log('Total Amount After Duplicate Removal:', duplicateSum);
};

run()
  .then(() => {
    console.log('Program finished...');
  })
  .catch(e => {
    console.error('Uncaught error in program run: ', e.message, e.stack);
  });
