//As a fallback for casses when we are not able to fetch redis_url from .env 
const { Server } = require('socket.io');
const Redis = require('ioredis');
const redis = new Redis();

module.exports = function initAuctionSocket(server) {
  const io = new Server(server, { cors: { origin: "*" } });

  io.on('connection', socket => {
    socket.on('joinAuction', async auctionId => {
      socket.join(auctionId);
      const highestBid = await redis.get(`auction:${auctionId}:highestBid`) || 0;
      socket.emit('highestBid', highestBid);
    });

    socket.on('placeBid', async ({ auctionId, amount, bidder }) => {
      const current = parseFloat(await redis.get(`auction:${auctionId}:highestBid`) || 0);
      if (amount > current) {
        await redis.set(`auction:${auctionId}:highestBid`, amount);
        io.to(auctionId).emit('newBid', { amount, bidder });
      }
    });
  });
};
