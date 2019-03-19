const fs = require('fs');
const logFile = 'output-' + Date.now() + '.log';
const stream = fs.createWriteStream(logFile, { flags: 'a' });

function log() {
  console.log(...arguments);
  stream.write([...arguments].join(' ') + '\n');
}

const argv = require('yargs').argv;

const argExit = error => {
  log('Error:', error);
  log('Required syntax is: yarn start --config <configpath> --csv <csvpath>');
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
  log('Failed to import config file...');
  log(e.message, e.stack);
  process.exit(1);
}

let input;

try {
  input = fs.readFileSync(argv.csv);
} catch (e) {
  log('Failed to import csv file...');
  log(e.message, e.stack);
  process.exit(1);
}

// Dependencies
const BigNumber = require('bignumber.js');
const parse = require('csv-parse/lib/sync');
const SimpleSignSystem = require('@haloplatform/simple-sign-system');
const sss = new SimpleSignSystem();

const records = parse(input, {
  columns: true,
  skip_empty_lines: true,
});

const sleep = time => {
  return new Promise(resolve => {
    setTimeout(resolve, time);
  });
};

const processAccount = async (count, record, web3) => {
  log('Processing (', count, ')', record.address, 'for amount of', record.amount);

  // check balances before
  const balance = new BigNumber(web3.utils.fromWei(await web3.eth.getBalance(record.address), 'ether'));
  const srcBalance = new BigNumber(web3.utils.fromWei(await web3.eth.getBalance(config.srcAccount), 'ether'));
  log('Pre airdrop balance (target, source): (', balance.toString(), ',', srcBalance.toString(), ')');

  // do airdrop
  let tx = {
    value: web3.utils.toHex(new BigNumber(web3.utils.toWei(record.amount, 'ether'))),
    from: config.srcAccount,
    to: record.address,
    gas: 21000,
  };

  const response = await sss.signAndSend(tx, web3.eth.accounts.wallet[0].privateKey, web3, false);

  log(JSON.stringify(response));

  const balance2 = new BigNumber(web3.utils.fromWei(await web3.eth.getBalance(record.address), 'ether'));
  const srcBalance2 = new BigNumber(web3.utils.fromWei(await web3.eth.getBalance(config.srcAccount), 'ether'));
  log('Post airdrop balance (targe, source): (', balance2.toString(), ',', srcBalance2.toString(), ')');

  if (!balance.plus(record.amount).eq(balance2)) {
    log('###########################');
    log('### ERROR BALANCE INCORRECT');
    log('###########################');
    await sleep(5000);
  }

  if (!srcBalance.minus(record.amount).eq(srcBalance2)) {
    log('###########################');
    log('### ERROR BALANCE INCORRECT');
    log('###########################');
    await sleep(5000);
  }
};

const run = async () => {
  // log(records);
  // log(records.length);
  const Web3 = require('web3');
  const web3 = new Web3(config.rpcUrl);
  web3.eth.accounts.wallet.add(config.srcPrivateKey);

  const theSrcBalance = new BigNumber(web3.utils.fromWei(await web3.eth.getBalance(config.srcAccount), 'ether'));

  let accounts = {};
  let goodAccounts = [];

  let sum = 0;
  let duplicateSum = 0;
  let valid = true;
  for (let i = 0; i < records.length; i++) {
    sum += Number(records[i].amount);
    if (!accounts[records[i].address]) {
      if (!web3.utils.isAddress(records[i].address)) {
        valid = false;
        log('Bad ADDRESS:', records[i].address, 'skipping address...');
      } else if (Number.isNaN(records[i].amount) || Number(records[i].amount) <= 0) {
        valid = false;
        log('Bad AMOUNT:', records[i].address, records[i].amount, 'skipping address...');
      } else {
        goodAccounts.push(records[i]);
        accounts[records[i].address] = true;
        duplicateSum += Number(records[i].amount);
      }
    }
  }

  if (valid === false) {
    log('##########################################################');
    log(
      'There were bad addresses, stop program if you wish to fix, otherwise continuing and skipping those payouts...'
    );
    log('##########################################################');
    await sleep(5000);
  }

  log('Source Account Pre Airdrop Balance:', theSrcBalance.toString());
  log('Total Addresses:', records.length);
  log('Total Amount:', sum);
  log('Total Addresses After Duplciate Removal:', goodAccounts.length);
  log('Total Amount After Duplicate Removal:', duplicateSum);

  log('Starting payout in 5 seconds');

  await sleep(5000);

  for (let i = 0; i < goodAccounts.length; i++) {
    await processAccount(i + '/' + goodAccounts.length, goodAccounts[i], web3);
  }

  const theSrcBalance2 = new BigNumber(web3.utils.fromWei(await web3.eth.getBalance(config.srcAccount), 'ether'));

  log('Total Paid To Address:', theSrcBalance.minus(theSrcBalance2).toString());
};

run()
  .then(() => {
    log('Program finished...');
    stream.end();
  })
  .catch(e => {
    log('Uncaught error in program run: ', e.message, e.stack);
  });
