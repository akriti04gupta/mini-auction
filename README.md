# Mini Auction System

A real-time auction platform built with **Node.js**, **Express**, **Socket.IO**, **Sequelize (PostgreSQL)**, **Redis**, and **React.js**.  
This system allows users to create auctions, place bids in real-time, and handle seller decisions with email notifications.

---

## **Features**

- **User-side:**
  - View all live and upcoming auctions.
  - Place real-time bids.
  - Receive updates on highest bid via Socket.IO.
  
- **Seller/Admin-side:**
  - Create auctions with start time, duration, and starting price.
  - Accept, reject, or send counter-offers for highest bids.
  - Manage auctions from an admin panel.
  
- **Email Notifications:**
  - SendGrid integration to notify buyers and sellers when an auction ends.
  - PDF invoice generation using `pdfkit`.

- **Real-time updates:**
  - Socket.IO powers live bidding and auction status updates.

- **Redis Caching:**
  - Highest bid caching for faster real-time updates.

- **Cron Jobs:**
  - Automatically check ended auctions and update status.

---

## **Tech Stack**

| Layer              | Technology                              |
|-------------------|----------------------------------------|
| Backend            | Node.js, Express                        |
| Real-time          | Socket.IO                               |
| Database           | PostgreSQL (via Sequelize)              |
| Caching            | Redis (Upstash or Local)                |
| Email              | SendGrid                                |
| Frontend           | React.js, MUI                           |
| PDF Generation     | PDFKit                                  |
| Scheduling Jobs    | node-cron                               |

---
mini-auction/
├─ backend/
│  ├─ index.js
│  ├─ config.js
│  ├─ db.js
│  ├─ redisClient.js
│  ├─ models/
│  │  ├─ Auction.js
│  │  └─ Bid.js
│  ├─ routes/
│  │  └─ auctionRoutes.js
│  ├─ emailService.js
│  └─ invoiceService.js
├─ frontend/
│  ├─ src/
│  │  ├─ AdminPanel.js
│  │  └─ ...
│  ├─ public/
│  └─ package.json
└─ README.md

## **Installation & Setup**

### **1. Clone the repository**
```bash
git clone <your-repo-url>
cd mini-auction
