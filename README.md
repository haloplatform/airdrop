# Airdrop

Simple airdrop script for Halo Platform, Ethereum, or Ethereum like chains.

Uses a single csv file with addresses and amounts, as well as a config file for inputting source account and network information.

# Install

```
git clone https://github.com/haloplatform/airdrop.git \
&& cd airdrop \
&& yarn
```

# Running

To run the airdrop, after you have your config and csv file in the folder simply do:

```
yarn start --config ./config.example --csv ./csv.example
```

Replacing the example files with the files of your choice. Make sure to put the path correctly.

:warning: **IMPORTANT** :warning:

There are a couple of times the program gives the better opportunity to stop it using `ctrl+c` These are after it validates data, and when a transfer fails. It will wait 5 seconds for you to cancel it and if you don't it will move one.

_**If you cancel an airdrop in progress, you will need to remove the accounts from the csv file that you have already processed. You can find these in the output log the program creates.**_

# Recommended Dry Run

You can do a dry run by connecting to the Halo Platform testnet or Eth Rinkeby. This is recommended so that you can find any issues in your config or csv before running against a live chain.

_**THIS IS HIGHLY RECOMMENDED TO DO**_

# Examples

There are two config examples in the repo.

The csv should be done in `<amount>,<address>` form. Where amount is a whole unit of Halo or ethereum. If you wish to send fractions uses decimals. You must leave the top line unchanged as it is used to pares the csv into correct js objects.

The config should have the url for which you will use for your RPC (Either localhost for full node locally, infura for eth remote, or halo rpc for Halo Platform), and it should also have the public address and private key for the account you wish to send from.
