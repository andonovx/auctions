const Broker = artifacts.require("Broker");
const ABC = artifacts.require("ABC");
const NFT = artifacts.require("NFT");

let brokerInstance;
let erc20Instance;
let erc1155Instance;

const nftId = 0;
const amountToSend = 1;
const auctionDuration = 180;
const auctionId = 0;

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

contract("Broker", (accounts) => {    
    const amount1 = 1000;
    const amount2 = 4000;

    before('mint and distribute the much needed tokens', async function () {
        erc20Instance = await ABC.new(700000000000000000000000000n, { from: accounts[0] });
        erc1155Instance = await NFT.new({from: accounts[3]});

        await erc20Instance.transfer(accounts[1], amount1, { from: accounts[0] });
        await erc20Instance.transfer(accounts[2], amount2, { from: accounts[0] });
    });
    
    it("creating an auction should transfer nft ownership and make the data about the auction available on-chain", async () => {

        brokerInstance = await Broker.new(accounts[3], { from: accounts[0] });
        const startPrice = 500;
        const endTime = BigInt(Math.floor(Date.now() / 1000) + auctionDuration);
        await erc1155Instance.setApprovalForAll(brokerInstance.address, true, { from: accounts[3] });

        const r1Before = await erc1155Instance.balanceOf.call(accounts[3], nftId);
        const r2Before = await erc1155Instance.balanceOf.call(brokerInstance.address, nftId);
        await brokerInstance.createAuction(erc20Instance.address, startPrice, erc1155Instance.address, nftId, amountToSend, endTime, {from: accounts[3]});
        
        const r1After = await erc1155Instance.balanceOf.call(accounts[3], nftId);
        const r2After = await erc1155Instance.balanceOf.call(brokerInstance.address, nftId);
        const auctionDataOnChain = await brokerInstance.auctions.call(0);

        assert.equal(
            +r1Before - amountToSend,
            +r1After,
            "createAuction() function is returning unexpected results. User A NFT balance does not get decreased properly"
        );
        assert.equal(
            +r2Before + amountToSend,
            +r2After,
            "createAuction() function is returning unexpected results. Broker NFT balance does not get increased properly"
        );

        assert.equal(
            startPrice, +auctionDataOnChain.startPrice,
            "createAuction() function is returning unexpected results. startPrice is not stored properly"
        )

        assert.equal(
            erc20Instance.address, auctionDataOnChain.token,
            "createAuction() function is returning unexpected results. erc20 token address is not stored properly"
        )

        assert.equal(
            erc1155Instance.address, auctionDataOnChain.nftContract,
            "createAuction() function is returning unexpected results. nftContract token address is not stored properly"
        )

        assert.equal(
            nftId, +auctionDataOnChain.nftId,
            "createAuction() function is returning unexpected results. nftId is not stored properly"
        )

        assert.equal(
            0, +auctionDataOnChain.bidCount,
            "createAuction() function is returning unexpected results. bidCount does not get initialized properly"
        )

        assert.equal(
            endTime, +auctionDataOnChain.endTime,
            "createAuction() function is returning unexpected results. endTime does not get stored properly"
        )

        assert.equal(
            false, auctionDataOnChain.closed,
            "createAuction() function is returning unexpected results. variable closed does not get initialized properly"
        )
        
    });

    it("invoking bid() functionality should transfer the erc20 tokens to the contract, update auction data and store bid data", async () => {
        const bidAmount = 1000;

        let tx = await erc20Instance.approve(brokerInstance.address, bidAmount, { from: accounts[1] });

        const balanceBeforeBidding = await erc20Instance.balanceOf.call(accounts[1]);
        const bidCountBefore = (await brokerInstance.auctions.call(auctionId)).bidCount;
        
        await brokerInstance.bidForAuction(auctionId, bidAmount, { from: accounts[1] });

        const balanceAfterBidding = await erc20Instance.balanceOf.call(accounts[1]);
        const bidCountAfter = (await brokerInstance.auctions.call(auctionId)).bidCount;

        assert.equal(
            +balanceBeforeBidding,
            +balanceAfterBidding + bidAmount,
            "bid() function is returning unexpected results. balance does not get decreased correctly"
            );
            
        assert.equal(
            +bidCountBefore + 1,
            +bidCountAfter,
            "bid() function is returning unexpected results. bidCount does not get incremented correctly"
            );
            
        let bidOnChain = await brokerInstance.bids.call(auctionId, bidCountAfter - 1);
        assert.equal(
            bidOnChain.bidAmount,
            bidAmount,
            "bid() function is returning unexpected results. bidAmount does not get stored properly"
            );

        assert.equal(
            accounts[1],
            bidOnChain.bidder,
            "bid() function is returning unexpected results. bidder address does not get stored properly"
            );
    });

    it("adding a higher bid then closing the auction (once it expires) should return money to bidders that lost, award the NFT to the highest bidder and transfer the top bid amount to the owner", async () => {

        const bidCountBefore = (await brokerInstance.auctions.call(auctionId)).bidCount;
        const bidsAndBalances = [];
        const bidAmount = 2000;

        for (let i=0; i < bidCountBefore; i++) {

            let bid = await brokerInstance.bids.call(auctionId, i);

            bidsAndBalances.push({
                address: bid.bidder,
                balanceWithRefund: +bid.bidAmount + (+ (await erc20Instance.balanceOf.call(bid.bidder)))
            })
        }

        const ownerBalanceBefore = await erc20Instance.balanceOf.call(accounts[3]);
        const winnerNftBalanceBefore = await erc1155Instance.balanceOf.call(accounts[2], nftId);

        await erc20Instance.approve(brokerInstance.address, bidAmount, { from: accounts[2] })
        await brokerInstance.bidForAuction(auctionId, bidAmount, { from: accounts[2] });
        await timeout(1000 * auctionDuration);
        await brokerInstance.closeAuction(auctionId, {from: accounts[3]});

        for (let i=0; i < bidCountBefore; i++) {
            assert.equal(
                bidsAndBalances[i].balanceWithRefund,
                + (await erc20Instance.balanceOf.call(bidsAndBalances[i].address)),
                "closeAuction() function is returning unexpected results. Auction losers' balances don't get set properly"
                );
        }

        const ownerBalanceAfter = await erc20Instance.balanceOf.call(accounts[3]);

        assert.equal(
            +ownerBalanceBefore + bidAmount,
            +ownerBalanceAfter,
            "closeAuction() function is returning unexpected results. owner balance does not get increased properly"
            );

        assert.equal(
            +winnerNftBalanceBefore + amountToSend, 
            +(await erc1155Instance.balanceOf.call(accounts[2], nftId)),
            "closeAuction() function is returning unexpected results. winner nft balance does not get increased properly"
        )

    });

})