const itemSale = artifacts.require("itemSale");
const polskiZloty = artifacts.require("polskiZloty");
const {
    BN,    
    balance,      
    constants,    // Common constants, like the zero address and largest integers
    expectEvent,  // Assertions for emitted events
    expectRevert, // Assertions for transactions that should fail
  } = require('@openzeppelin/test-helpers');
const { web3 } = require('@openzeppelin/test-helpers/src/setup');
const { assert } = require('chai');

  
let polskiZlotyContract ;
let itemSaleContract ;
let buyer; 
let seller; 
let arbitrator; 
let token; 
let valueEth; 
let valueERC;


before(async ()=> {
    polskiZlotyContract = await polskiZloty.deployed();
    itemSaleContract = await itemSale.deployed();
    buyer = await itemSaleContract.buyer();
    seller = await itemSaleContract.seller();
    arbitrator = await itemSaleContract.arbitrator();
    token = await itemSaleContract.token();
    valueEth = await itemSaleContract.valueEth();
    valueEth = valueEth.toNumber();
    valueERC = await itemSaleContract.valueERC();
    valueERC = valueERC.toNumber();
})


contract("Test for variables",async (accounts)=> { 
    it('should deploy smart contracts properly', async ()=> {
        assert.notEqual(polskiZlotyContract.address, '', "polskiZloty smart contract not deployed properly");
        assert.notEqual(itemSaleContract.address, '', "itemSaleContract smart contract not deployed properly");
    })

    it('itemSale contract variables are set up correctly', async ()=> {
        let _seller = accounts[0]; 
        let _buyer = accounts[1]; 
        let _arbitrator = accounts[2]; 

        assert.equal(buyer, _buyer, "Buyer does not match");
        assert.equal(seller, _seller , "Seller does not match");
        assert.equal(arbitrator, _arbitrator, "Arbitrator does not match");
        assert.equal(token, polskiZlotyContract.address, "token does not match");
        assert.equal(valueEth, 1000, "Ether value does not match");
        assert.equal(valueERC, 10, "ERC20 token value does not match");
    })
    it('ERC20 contract variables are set up correctly', async ()=> {
        const ERCtotalSupply = await polskiZlotyContract.totalSupply();
        const buyerBalance = await polskiZlotyContract.balanceOf(buyer);

        assert.equal(ERCtotalSupply, 1000, "ERC20 initialSupply does not match");
        assert.equal(buyerBalance, 1000, "ERC20 buyer balance does not match");
    })
    it('can only invoke the funcitons of its role',async ()=>{
       await polskiZlotyContract.approve(itemSaleContract.address,valueERC,{from:buyer});
       await expectRevert(itemSaleContract.purchaseProductETH({from:seller,value:valueEth}),'this function can only be called by buyer');
       await expectRevert(itemSaleContract.purchaseProductERC({from:seller}),'this function can only be called by buyer');
       //@TODO
       //await expectRevert(itemSaleContract.resolveDispute(true,{from:arbitrator}),'This function can only be called by arbitrator');
    })
});


contract("Testing purchaseProductETH", async ()=> {
    it('can buy item one time for specified price in ETH', async ()=> {
        await expectRevert(itemSaleContract.purchaseProductETH({from:buyer, value:(valueEth-1)}), 'too little wei transferred');//trying to buy item for less than specifed price
        await itemSaleContract.purchaseProductETH({from:buyer, value:valueEth});
        let itemSaleBalance = await balance.current(itemSaleContract.address);
        assert.equal(itemSaleBalance, 1000, "wei has not been transfered to smart contract");
        await expectRevert(itemSaleContract.purchaseProductETH({from:buyer, value:valueEth}), 'this function can only be called in purchasing stage');//you cannot buy twice
        await expectRevert(itemSaleContract.purchaseProductERC({from:buyer}), 'this function can only be called in purchasing stage');//you cannot buy item for erc if bought it for ethereum
    })
    it('can confirmItemReceived', async ()=> {
        // let initialSellerBalance = await balance.current(seller);
    
 
        // await itemSaleContract.confirmItemReceived({from:buyer});
        // let balanceAfter = await balance.current(seller);
        
        // assert.equal(balanceAfter, initialSellerBalance+balanceAfter, "Money was not transferred to seller"); 
    })
})