// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";

contract Broker is ERC1155Holder {

    struct Auction {
        uint startPrice;
        ERC20 token;

        ERC1155 nftContract; 
        uint nftId;
        uint amount;

        uint bidCount;

        uint endTime;
        bool closed;
    }

    struct Bid {
        address bidder;
        uint bidAmount;
    }

    mapping (uint => Auction) public auctions;
    mapping (uint => mapping (uint => Bid)) public bids;
    uint public auctionCount;

    address public owner;

    event AuctionCreated(address indexed nftContract, uint indexed nftId, uint indexed auctionId);
    event AuctionClosed(uint indexed auctionId, address indexed tokenAddress, uint price, address winner);
    event BidMade(uint indexed auctionId, address tokenAddress, uint price);

    modifier onlyOwner {
        require(msg.sender == owner, 'You are not the owner.');
        _;
    }
    
    function closeAuction(uint auctionId) external onlyOwner {
        Auction memory auction = auctions[auctionId];

        require(!auction.closed, "The auction is already closed");
        require(block.timestamp > auction.endTime, "The auction has not ended yet");
        require(auction.bidCount != 0, "This auction can not be closed since it has no bids");
        
        Bid memory bid;

        // Returning tokens to bidders who have lost the auction
        for (uint i=0; i < auctions[auctionId].bidCount - 1;) { 
            bid = bids[auctionId][i];
            auction.token.transfer(bid.bidder, bid.bidAmount);
            unchecked {
                i++;
            }
        }

        bid = bids[auctionId][auction.bidCount - 1];

        // Transferring tokens to auction owner
        auction.token.transfer(owner, bid.bidAmount);
        // Transferring the nft to the auction winner
        auction.nftContract.safeTransferFrom(address(this), bid.bidder, auction.nftId, auction.amount, "");
        auctions[auctionId].closed = true;
        emit AuctionClosed(auctionId, address(auction.nftContract), bid.bidAmount, bid.bidder);
    }

    function createAuction(address tokenAddress, uint startPrice, address nftContractAddress, uint nftId, uint amount, uint endTime) external onlyOwner {
        require(block.timestamp < endTime, "Auction end time must be in the future");
        require(tokenAddress != address(0x0) && nftContractAddress != address(0x0), "Token addresses must be valid");

        Auction memory auction = Auction(
            {
                startPrice: startPrice, 
                token: ERC20(tokenAddress),
                nftContract: ERC1155(nftContractAddress),
                nftId: nftId,
                amount: amount, 
                endTime: endTime, 
                closed: false, 
                bidCount: 0
            }
        );

        // Transferring the nft to the broker contract
        auction.nftContract.safeTransferFrom(msg.sender, address(this), nftId, amount, "");

        // Storing the auction data on-chain
        auctions[auctionCount] = auction;
        
        emit AuctionCreated(nftContractAddress, nftId, auctionCount++);
    }
    
    function bidForAuction(uint auctionId, uint amount) external {
        Auction memory auction = auctions[auctionId];

        require(auction.endTime > block.timestamp, "The auction has ended");
        require(amount > auction.startPrice, "The bid must be higher than the start price");
        
        if (auction.bidCount > 0) {
            require(amount > bids[auctionId][auction.bidCount - 1].bidAmount, "The bid must be higher than the current highest bid");
        }

        // Transferring erc20 tokens to Broker contract
        auction.token.transferFrom(msg.sender, address(this), amount);

        Bid memory bid = Bid(
            {
                bidAmount: amount, 
                bidder: msg.sender
            }
        );

        auctions[auctionId].bidCount++;
        // Storing bid details on-chain
        bids[auctionId][auction.bidCount] = bid;

        emit BidMade(auctionId, address(auction.nftContract), amount);
    }

    constructor(address _owner) {
        owner = _owner;
    }

}