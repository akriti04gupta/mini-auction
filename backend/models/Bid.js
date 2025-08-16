const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Auction = require('./Auction');

const Bid = sequelize.define('Bid', {
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  bidder: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

Auction.hasMany(Bid, { foreignKey: 'AuctionId', onDelete: 'CASCADE' });
Bid.belongsTo(Auction, { foreignKey: 'AuctionId' });

module.exports = Bid;
