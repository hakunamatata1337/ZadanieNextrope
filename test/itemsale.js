const itemSale = artifacts.require("itemSale");
const polskiZloty = artifacts.require("polskiZloty");
const {
    BN,    
    balance,      
    constants,    // Common constants, like the zero address and largest integers
    expectEvent,  // Assertions for emitted events
    expectRevert, // Assertions for transactions that should fail
  } = require('@openzeppelin/test-helpers');
const { assert } = require('chai');




before(async ()=> {
    polskiZlotyContract = await polskiZloty.deployed();
    itemSaleContract = await itemSale.deployed();
    buyer = await itemSaleContract.buyer();
    seller = await itemSaleContract.seller();
    arbitrator = await itemSaleContract.arbitrator();
    token = await itemSaleContract.token();
    valueEth = await itemSaleContract.valueEth();
    valueERC = await itemSaleContract.valueERC();
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

        let _valueEth = web3.utils.toWei('1', 'ether');
       
        
        assert.equal(buyer, _buyer, "Buyer does not match");
        assert.equal(seller, _seller , "Seller does not match");
        assert.equal(arbitrator, _arbitrator, "Arbitrator does not match");
        assert.equal(token, polskiZlotyContract.address, "token does not match");
        assert.equal(valueEth, _valueEth, "Ether value does not match");
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
     })
})

contract("Testing purchaseProductETH", async ()=> {
    it('can buy item one time for specified price in ETH', async ()=> {
        let _itemSaleBalance = web3.utils.toWei('1', 'ether');

        await expectRevert(itemSaleContract.purchaseProductETH({from:buyer, value:27}), 'too little wei transferred');//trying to buy item for less than specifed price
        await itemSaleContract.purchaseProductETH({from:buyer, value:valueEth});
        let itemSaleBalance = await balance.current(itemSaleContract.address);
        assert.equal(itemSaleBalance, _itemSaleBalance, "wei has not been transfered to smart contract");
        await expectRevert(itemSaleContract.purchaseProductETH({from:buyer, value:valueEth}), 'this function can only be called in purchasing stage');//you cannot buy twice
        await expectRevert(itemSaleContract.purchaseProductERC({from:buyer}), 'this function can only be called in purchasing stage');//you cannot buy item for erc if bought it for ethereum
    })
    it('can confirmItemReceived', async ()=> {
        await itemSaleContract.confirmItemReceived({from:buyer}); 
    })

    it('arbitrator cant resolve dispute when sale is over', async ()=>{
        await expectRevert(itemSaleContract.resolveDispute(true,{from:arbitrator}),'SaleStatus must be equal to boughtByERC or boughtByETH');
    })
})

contract("Testing purchaseProductERC", async ()=> {
    it('can buy item one time for specified price in ERC20', async ()=> {
        await polskiZlotyContract.approve(itemSaleContract.address,valueERC,{from:buyer});
        await itemSaleContract.purchaseProductERC({from:buyer});
        let itemSaleBalance = await polskiZlotyContract.balanceOf(itemSaleContract.address);
        assert.equal(itemSaleBalance,10,"ERC20 not transferred correctly");
    })
    it('can confirm ItemReceived', async ()=>{
        let balanceOfSellerBefore =  await polskiZlotyContract.balanceOf(seller);
        balanceOfSellerBefore = balanceOfSellerBefore.toNumber();
        await itemSaleContract.confirmItemReceived({from:buyer}); 
        let balanceAfter = await polskiZlotyContract.balanceOf(seller);
        assert.equal(balanceAfter,balanceOfSellerBefore+10, "ERC20 not transsfered correctly");
    })
})

contract("resolveDispute when seller is right", async ()=> {
    it('resolve dispute', async ()=>{
        await itemSaleContract.purchaseProductETH({from:buyer, value:valueEth});
        //buyer does not to want confirm that he received item so arbitrator needs to resolve Dispute

        //buyer tries to call resolveDispute function 
        await expectRevert(itemSaleContract.resolveDispute(false,{from:buyer}),'This function can only be called by arbitrator');
        await itemSaleContract.resolveDispute(true,{from:arbitrator});
    })
})

contract("resolveDispute when buyer is right", async ()=> {
    it('resolve dispute', async ()=>{
        await polskiZlotyContract.approve(itemSaleContract.address,valueERC,{from:buyer});
        await itemSaleContract.purchaseProductERC({from:buyer});
        let balanceOfBuyerBefore = await polskiZlotyContract.balanceOf(buyer);
        balanceOfBuyerBefore = balanceOfBuyerBefore.toNumber();
        //seller refuses to ship the item
        
        //seller tries to call resolveDispute function 
        await expectRevert(itemSaleContract.resolveDispute(false,{from:seller}),'This function can only be called by arbitrator');
        await itemSaleContract.resolveDispute(false,{from:arbitrator});

        let balanceAfter = await polskiZlotyContract.balanceOf(buyer);
        assert.equal(balanceAfter, balanceOfBuyerBefore+10, "ERC20 not transferred correctly");
    })
})