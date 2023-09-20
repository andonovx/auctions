
const privateKey = "ec9a4d7bee47f5a750fe41373064e1622ad392a6e91fdfcaa7c43211c31cc2cb";
const HDWalletProvider = require('@truffle/hdwallet-provider');
//
const fs = require('fs');
const mnemonic = fs.readFileSync(".secret").toString().trim();

module.exports = {
   plugins: [
    'truffle-plugin-verify'//, 'solidity-coverage'
  ],
   api_keys: {
    bscscan: "G5R2DKA8TFPC7C28N1CK7VQYW1M4MFDU5X",
    etherscan: "CRDK1NFGTUGI1B5Z7YN338GZGXVGIVYR12",
    polygonscan: "U9QBAQ5VAF3ZSTP18P33GVMM4IBFMBPB65"
  },
  networks: {
    // Useful for testing. The `development` name is special - truffle uses it by default
    // if it's defined here and no other network is specified at the command line.
    // You should run a client (like ganache-cli, geth or parity) in a separate terminal
    // tab if you use this network and you must also set the `host`, `port` and `network_id`
    // options below to some value.
    //
     development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 8545,            // Standard Ethereum port (default: none)
      network_id: "*",       // Any network (default: none)
     },
     
    mumbai: {
      provider: () => new HDWalletProvider(mnemonic, "PASTE YOUR WEBSOCKET WEB3 PROVIDER HERE"),
      network_id: 80001,
      confirmations: 1,
      timeoutBlocks: 1,
      skipDryRun: true
    }

  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
     timeout: 10000000000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.21",    // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
       settings: {          // See the solidity docs for advice about optimization and evmVersion
        optimizer: {
          enabled: true,
          runs: 10000000
        }
        ,evmVersion: "byzantium"
       }
    }
  },

  // Truffle DB is currently disabled by default; to enable it, change enabled:
  // false to enabled: true. The default storage location can also be
  // overridden by specifying the adapter settings, as shown in the commented code below.
  //
  // NOTE: It is not possible to migrate your contracts to truffle DB and you should
  // make a backup of your artifacts to a safe location before enabling this feature.
  //
  // After you backed up your artifacts you can utilize db by running migrate as follows: 
  // $ truffle migrate --reset --compile-all
  //
  // db: {
    // enabled: false,
    // host: "127.0.0.1",
    // adapter: {
    //   name: "sqlite",
    //   settings: {
    //     directory: ".db"
    //   }
    // }
  // }
};