const Broker = artifacts.require("Broker");

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(Broker, accounts[3]);
};