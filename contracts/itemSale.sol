pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract itemSale {
   
    modifier onlyBuyer() {
        require(msg.sender == buyer, "this function can only be called by buyer");
        _;
    }
    modifier onlyPurchasingStage() {
        require(saleStatus == SaleStatus.purchasingStage, "this function can only be called in purchasing stage");
        _;
    }
    modifier onlyBoughtStage() {
        require(saleStatus == SaleStatus.boughtByERC || saleStatus == SaleStatus.boughtByETH, "SaleStatus must be equal to boughtByERC or boughtByETH");
        _;
    }
     enum SaleStatus {
        purchasingStage,
        boughtByETH,
        boughtByERC,
        EndOfSale
    }
    SaleStatus public saleStatus = SaleStatus.purchasingStage;
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
    //function for purchasing item for ETH
    function purchaseProductETH() external payable onlyBuyer() onlyPurchasingStage(){
        require(msg.value == valueEth, "too little wei transferred");
        saleStatus = SaleStatus.boughtByETH;
    } 
    //function for purchasing product for ERC
    //Before invoking this function u need to approve this smart contract to spend your ERC 20
    function purchaseProductERC() external  onlyBuyer() onlyPurchasingStage(){
        bool success= token.transferFrom(msg.sender,address(this), valueERC);
        require(success, "Transaction Failed");
        saleStatus = SaleStatus.boughtByERC;
    } 

    function confirmItemReceived() external onlyBuyer() onlyBoughtStage(){
        if(saleStatus == SaleStatus.boughtByETH){
              seller.transfer(valueEth);
        }
        else{
              token.transfer(seller, valueERC);
        }
        saleStatus = SaleStatus.EndOfSale;
    }

    function resolveDispute(bool isSellerRight) external onlyBoughtStage(){
        require(msg.sender == arbitrator, "This function can only be called by arbitrator");
        if(isSellerRight) {
            if(saleStatus == SaleStatus.boughtByETH){
                seller.transfer(valueEth);
            }
            else {
                token.transfer(seller, valueERC);
            }
            
        }else {
             if(saleStatus == SaleStatus.boughtByETH){
                buyer.transfer(valueEth);
            }
            else {
                token.transfer(buyer, valueERC);
            }
        }
        saleStatus = SaleStatus.EndOfSale;
    }
}