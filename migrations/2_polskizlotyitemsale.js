const itemSale = artifacts.require("itemSale");
const polskiZloty = artifacts.require("polskiZloty");

module.exports = function async (deployer) {
  deployer.deploy(polskiZloty,1000).then(function() {
    return deployer.deploy(itemSale, '0xA3BdE5Ce03644327cf93b298996e0Adf63e515D1','0xcAeE9C963bB6AAF46a3aD7eF4E9C24bf0C100B2f','0xF9C29AF4E2fa43a39Fd4C12694239C9A58CF89e6',1000,10, polskiZloty.address);
  });
};
