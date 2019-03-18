# Airdrop

Simple airdrop script for Halo Platform, Ethereum, or Ethereum like chains.

Uses a single csv file with addresses and amounts, as well as a config file for inputting source account and network information.

# Examples

There are two config examples in the repo.

The csv should be done in `<amount>,<address>` form. Where amount is a whole unit of Halo or ethereum. If you wish to send fractions uses decimals.

The config should have the url for which you will use for your RPC (Either localhost for full node locally, infura for eth remote, or halo rpc for Halo Platform), and it should also have the public address and private key for the account you wish to send from.

# Running

To run the airdrop, after you have your config and csv file in the folder simply do:

```
yarn start --config ./config.example --csv ./csv.example
```

Replacing the example files with the files of your choice. Make sure to put the path correctly.

## Recommended Dry Run

You can do a dry run by connecting to the Halo Platform testnet or Eth Rinkeby. This is recommended so that you can find any issues in your config or csv before running against a live chain.

# Disclaimer

Use at your own risk. Only you are responsible for any losses due to script malfunctions or improper configurations. ShadowCodex and Halo Platform are not liable for anything due to use of this open source software. You agree to this when you run your program.
