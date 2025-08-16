// =====================
// Mini Auction Backend
// =====================

const express = require('express');
const http = require('http');
const cors = require('cors'); 
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const path = require("path");
const { Op } = require('sequelize'); 
const cron = require('node-cron');

dotenv.config();

const sequelize = require('./db');
const Auction = require('./models/Auction');
const Bid = require('./models/Bid');
const auctionRoutes = require('./routes/auctionRoutes');
const redis = require('./redisClient');

const app = express();
app.use(cors());
app.use(express.json());

// === Relationships ===
Auction.hasMany(Bid, { foreignKey: 'AuctionId', onDelete: 'CASCADE' });
Bid.belongsTo(Auction, { foreignKey: 'AuctionId' });

// === Routes ===
app.use('/api/auction', auctionRoutes);

// === Logging middleware ===
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});



// === Sync database ===
sequelize.sync() 
.then(() => {
    console.log('Database synced (alter)');
})
.catch(err => console.error('Database sync error:', err));

const frontendBuildPath = path.join(__dirname, "..", "frontend", "build");
app.use(express.static(frontendBuildPath));
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendBuildPath, "index.html"));
});

// === Helper function ===
function getAuctionWindow(auction) {
    const start = new Date(auction.goLiveTime).getTime();
    const end = start + auction.durationMinutes * 60 * 1000;
    return { start, end };
}

// === Socket.IO Server ===
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.set('io', io);

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('joinAuction', async (auctionId) => {
        try {
            auctionId = String(auctionId);
            socket.join(auctionId);
            console.log(`Socket ${socket.id} joined auction ${auctionId}`);

            let highest = await redis.get(`auction:${auctionId}:highestBid`);
            if (highest == null) {
                const topBid = await Bid.findOne({
                    where: { AuctionId: auctionId },
                    order: [['amount', 'DESC']],
                });
                const auction = await Auction.findByPk(auctionId);
                highest = topBid ? topBid.amount : (auction ? auction.startPrice : 0);
                await redis.set(`auction:${auctionId}:highestBid`, String(highest));
            }
            socket.emit('highestBid', parseFloat(highest));
        } catch (err) {
            console.error('joinAuction error', err);
            socket.emit('bidError', 'Unable to join auction');
        }
    });

    socket.on('placeBid', async ({ auctionId, amount, bidder }) => {
        try {
            auctionId = String(auctionId);
            amount = parseFloat(amount);

            const auction = await Auction.findByPk(auctionId);
            if (!auction) return socket.emit('bidError', 'Auction not found');
            if (auction.status !== 'active') return socket.emit('bidError', 'Auction is not active');

            const { start, end } = getAuctionWindow(auction);
            const now = Date.now();

            if (now < start) return socket.emit('bidError', 'Auction has not started yet');
            if (now > end) return socket.emit('bidError', 'Auction has already ended');

            let highest = await redis.get(`auction:${auctionId}:highestBid`);
            highest = highest ? parseFloat(highest) : auction.startPrice;

            const minAllowed = highest + auction.bidIncrement;
            if (amount < minAllowed) {
                return socket.emit('bidError', `Bid must be at least ₹${minAllowed}`);
            }

            await Bid.create({ amount, bidder, AuctionId: auctionId });
            await redis.set(`auction:${auctionId}:highestBid`, String(amount));

            io.to(auctionId).emit('newBid', { amount, bidder });
            
        } catch (err) {
            console.error('placeBid error', err);
            socket.emit('bidError', 'Error placing bid');
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// === Cron job: Check for ended auctions ===
cron.schedule('* * * * *', async () => {
    console.log('Running cron job: Checking for ended auctions...');
    try {
        const now = new Date();
        const endedAuctions = await Auction.findAll({
            where: {
                [Op.and]: [
                    sequelize.where(
                        sequelize.literal(`"goLiveTime" + "durationMinutes" * interval '1 minute'`),
                        { [Op.lt]: now }
                    ),
                    { status: 'active' }
                ]
            }
        });

        for (const auction of endedAuctions) {
            console.log(`Auction ${auction.id} has ended. Updating status to 'pending_decision'.`);
            
            auction.status = 'pending_decision';
            await auction.save();

            const highestBid = await Bid.findOne({
                where: { AuctionId: auction.id },
                order: [['amount', 'DESC']],
            });

            io.to(String(auction.id)).emit('decision_required', {
                auctionId: auction.id,
                highestBid: highestBid ? highestBid.toJSON() : null
            });
        }
    } catch (err) {
        console.error('Error in cron job:', err);
    }
});

// === Start Server ===
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
