# CONTENT OF THE REPOSITORY

./contracts contains the code of the contracts

./tests contains the tests

./migrations contains the migration script

./truffle-config.js represents truffle's configuration file

./.secret file should contain the seed phrase of the wallet that truffle is going to use - paste your wallet seed phrase there

# PREREQUISITES

In order to compile the contracts using truffle, you must install Node.js, npm and Truffle.

Run npm install in order to install all the dependencies.

In order to run the tests locally you must install the Ganache or some other server that will set up a blockchain locally.

Another solution is to connect to a tesnet - truffle-config.js already has the configuration for Polygon Mumbai testnet, just aquire a web3 provider (e.g. through chainstack - https://chainstack.com/), and 

# COMPILING 

In order to compile the contracts, run the following command:

truffle compile

Configuration is set to use the latest solidity compiler solc 0.8.21.

# RUNNING TESTS

In order to run the tests locally, run the following command:

truffle test

In order to run the tests on Mumbai testnet, run the following command:

truffle test --network mumbai

Tests assume that logic behind ERC20 and ERC1155 tokens used is valid.

# DEPLOYING

In order to deploy the contracts to Mumbai testnet, run the following command:

truffle migrate --network mumbai

# VERIFYING

In order to verify the contract on Mumbai testnet, run the following command:

truffle run verify Broker --network mumbai       

# SOLUTION IMPROVEMENT PROPOSITION

The solution could further be improved by introducing an intermediary backend that would store data regarding the auctions and bids. This would cut down the gas costs of all the actors in the auctions significantly. 

ZK signatures would be introduced, NFT owners would sign auction details, while bidders would sign the bid details.

Bidders could make a one-time approval of their ERC-20 tokens, to the Broker contract.
Sellers/Nft owners approve their ERC1155 tokens to the Broker contract once. 

Bidders would only have to pay for bid cancellation transaction - if we opt out to support that functionality.

Furthermore, no erc20 refund transfer would be made to bidders that have lost the auction.

When finalizing the auctions, the sellers would trigger transactions using the auction and bid data and signatures - data regarding only the auction and winning bid would be stored on-chain, in order to prevent the multiple usage of the same signatures. 