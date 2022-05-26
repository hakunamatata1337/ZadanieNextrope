const itemSale = artifacts.require("itemSale");
const polskiZloty = artifacts.require("polskiZloty");


module.exports = function async (deployer,network,accounts) {
  deployer.deploy(polskiZloty,1000,accounts[1]).then(function() {
    return deployer.deploy(itemSale, accounts[0],accounts[1],accounts[2],1000,10, polskiZloty.address);
  });
};

