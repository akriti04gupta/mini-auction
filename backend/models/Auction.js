const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Auction = sequelize.define('Auction', {
  itemName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  startPrice: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  bidIncrement: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  goLiveTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  durationMinutes: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  sellerId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM(
      'active',
      'pending_decision',
      'sold',
      'closed_no_winner',
      'counter_offered'
    ),
    defaultValue: 'active'
  },
  winnerId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  finalPrice: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  counterOfferPrice: {
    type: DataTypes.FLOAT,
    allowNull: true
  }
}, {
  tableName: 'Auctions'
});

module.exports = Auction;
