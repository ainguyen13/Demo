var BlindAuction = artifacts.require("BlindAuction.sol");
var Market = artifacts.require("Market.sol");
module.exports = function (deployer) {
    deployer.deploy(BlindAuction);
    deployer.deploy(Market);
};