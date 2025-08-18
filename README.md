# 🏷️ Mini Auction System

A **real-time online auction platform** built with **Node.js**, **Express**, **Socket.IO**, **Sequelize (PostgreSQL)**, **Redis**, and **React.js**.  
This system allows sellers to create auctions, buyers to place bids in real-time, and both parties to get instant updates.

---

## 🚀 Features

### 👤 User-side
- View all **live and upcoming auctions**  
- Place **real-time bids** with instant updates  
- Automatically receive notifications when outbid  
- View auction **results and winners**  

### 🛒 Seller-side
- Create auctions with:
  - Item name & description
  - Starting price & bid increment
  - Auction go-live time & duration
- Receive **email notifications** when the auction ends
- View the highest bidder and finalize results  

### ⚡ System-side
- Real-time communication powered by **Socket.IO**
- Optimized bidding using **Redis** for caching
- Persistent auction and user data stored in **PostgreSQL** via Sequelize ORM

---

## 🛠️ Tech Stack
- **Frontend**: React.js  
- **Backend**: Node.js, Express.js  
- **Database**: PostgreSQL (via Sequelize ORM)  
- **Caching**: Redis  
- **Real-Time Communication**: Socket.IO  
- **Email Notifications**: SendGrid  

---

## 📥 Download & Run Locally

### ✅ Prerequisites
Make sure you have installed:
- [Node.js](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/)
- [Redis](https://redis.io/)

---

### 📌 Steps to Run

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/mini-auction.git
   cd mini-auction
