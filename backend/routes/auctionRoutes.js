const express = require('express');
const router = express.Router();
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const redis = require('../redisClient');
const { sendSaleConfirmationEmails } = require('../emailService'); 

//get the highest bid from the database
async function getHighestBidRow(auctionId) {
  return Bid.findOne({
    where: { AuctionId: auctionId },
    order: [['amount', 'DESC']]
  });
}

// === Standard CRUD Routes ===

// Create a new auction
router.post('/', async (req, res) => {
  try {
    const { goLiveTime, durationMinutes } = req.body;
    if (!goLiveTime || !durationMinutes) {
        return res.status(400).json({ error: "goLiveTime and durationMinutes are required." });
    }
    const startTime = new Date(goLiveTime);
    const endTime = new Date(startTime.getTime() + durationMinutes * 60000);
    
    const auction = await Auction.create({ ...req.body, endTime });

    await redis.set(`auction:${auction.id}:highestBid`, String(auction.startPrice));
    
    res.status(201).json(auction);
  } catch (err) {
    console.error('Create auction error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get all auctions
router.get('/', async (req, res) => {
  try {
    const auctions = await Auction.findAll({ order: [['goLiveTime', 'ASC']] });
    res.json(auctions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single auction by ID
router.get('/:id', async (req, res) => {
  try {
    const auction = await Auction.findByPk(req.params.id, {
      include: [{ model: Bid, order: [['amount', 'DESC']] }]
    });
    if (!auction) return res.status(404).json({ error: "Auction not found" });
    res.json(auction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// --Seller Decision Route --
router.post('/:id/decision', async (req, res) => {
    const { id: auctionId } = req.params;
    const { decision, counterPrice } = req.body;
    const io = req.app.get('io');

    try {
        const auction = await Auction.findByPk(auctionId);
        if (!auction) return res.status(404).json({ error: "Auction not found" });

        if (auction.status !== 'pending_decision') {
            return res.status(400).json({ error: "Auction is not awaiting a decision." });
        }

        const highestBid = await getHighestBidRow(auctionId);

        if (decision === 'accept') {
            if (!highestBid) return res.status(400).json({ error: "No bids to accept." });
            auction.status = 'sold';
            auction.winnerId = highestBid.bidder;
            auction.finalPrice = highestBid.amount;
            await auction.save();

            //Since I havent implemented authentication for so i have provided my own emails for testing(as seller and bidder) 
            await sendSaleConfirmationEmails(auction, 'akuu04gupta@gmail.com', 'akritiabi@gmail.com');

            io.to(String(auctionId)).emit('seller_decision_made', { auctionId, status: 'sold', finalPrice: auction.finalPrice, winnerId: auction.winnerId });
            return res.json({ message: 'Bid accepted successfully.' });
        }

        if (decision === 'reject') {
            auction.status = 'closed_no_winner';
            await auction.save();
            io.to(String(auctionId)).emit('seller_decision_made', { auctionId, status: 'closed_no_winner' });
            return res.json({ message: 'Bid rejected.' });
        }

        if (decision === 'counter') {
            if (!highestBid) return res.status(400).json({ error: "No bids to counter-offer." });
            if (!counterPrice || Number(counterPrice) <= highestBid.amount) {
                return res.status(400).json({ error: 'Counter price must be higher than the highest bid.' });
            }
            auction.status = 'counter_offered';
            auction.counterOfferPrice = Number(counterPrice);
            await auction.save();
            io.to(String(auctionId)).emit('counter_offer_received', { auctionId, counterPrice: auction.counterOfferPrice, highestBidder: highestBid.bidder });
            return res.json({ message: 'Counter-offer sent.' });
        }

        return res.status(400).json({ error: 'Invalid decision.' });

    } catch (err) {
        console.error(`Error processing decision for auction ${auctionId}:`, err);
        res.status(500).json({ error: 'Server error while processing decision.' });
    }
});

// === Buyer Response Route for Counter-Offers ===
router.post('/:id/counter-response', async (req, res) => {
    const { id: auctionId } = req.params;
    const { response } = req.body;
    const io = req.app.get('io');

    try {
        const auction = await Auction.findByPk(auctionId);
        if (!auction) return res.status(404).json({ error: "Auction not found" });
        if (auction.status !== 'counter_offered') {
            return res.status(400).json({ error: "Auction is not in a counter-offer state." });
        }

        const highestBid = await getHighestBidRow(auctionId);

        if (response === 'accept') {
            auction.status = 'sold';
            auction.winnerId = highestBid.bidder;
            auction.finalPrice = auction.counterOfferPrice;
            await auction.save();

            await sendSaleConfirmationEmails(auction, 'akuu04gupta@gmail.com', 'akritiabi@gmail.com');

            io.to(String(auctionId)).emit('seller_decision_made', { auctionId, status: 'sold', finalPrice: auction.finalPrice, winnerId: auction.winnerId });
            return res.json({ message: 'Counter-offer accepted.' });

        } else {
            auction.status = 'closed_no_winner';
            await auction.save();
            io.to(String(auctionId)).emit('seller_decision_made', { auctionId, status: 'closed_no_winner' });
            return res.json({ message: 'Counter-offer rejected.' });
        }

    } catch (err) {
        console.error(`Error processing counter-response for auction ${auctionId}:`, err);
        res.status(500).json({ error: 'Server error while processing counter-response.' });
    }
});

module.exports = router;
