pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract itemSale {

    modifier onlyBuyer() {
        require(msg.sender == buyer, "this function can only be called by buyer");
        _;
    }

    IERC20 public immutable token;

    uint public immutable valueEth;
    uint public immutable valueERC;

    address payable public immutable seller;
    address payable public immutable buyer;
    address public immutable arbitrator;

    constructor(address _seller,address _buyer,address _arbitrator ,uint _valueEth,uint _valueERC,address _tokenAddress){
        token = IERC20(_tokenAddress);
        seller = payable(_seller);
        buyer = payable(_buyer);
        arbitrator = _arbitrator;
        valueEth = _valueEth;
        valueERC = _valueERC;
    }

    function purchaseProductETH() external payable onlyBuyer(){
        require(msg.value == valueEth, "too little wei transferred");
    } 
    //Before invoking this function u need to approve this smart contract to spend your ERC 20
    function purchaseProductERC() external  onlyBuyer(){
        bool success= token.transferFrom(msg.sender,address(this), valueERC);
        require(success, "Transaction Failed");
    } 
   

    function confirmItemReceived() external onlyBuyer(){
        if(address(this).balance >= valueEth){
              seller.transfer(valueEth);
        }
        if(token.balanceOf(address(this)) >= valueERC){
              token.transfer(seller, valueERC);
        }
    }

    function resolveDispute(bool isSellerRight) external {
        require(msg.sender == arbitrator, "This function can only be called by arbitrator");
        if(isSellerRight) {
            seller.transfer(address(this).balance);
            token.transfer(seller, valueERC);
        }else {
            buyer.transfer(address(this).balance);
            token.transfer(buyer, valueERC);
        }
    }
}