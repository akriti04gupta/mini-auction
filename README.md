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

## 📂 Project Structure

```bash
mini-auction/
│── backend/          # Node.js/Express backend
│   ├── models/       # Sequelize models
│   ├── routes/       # API routes
│   ├── sockets/      # Socket.IO logic
│   └── utils/        # Email, Redis, PDF helpers
│
│── frontend/         # React frontend
│   ├── src/          # React components & pages
│   └── public/       # Static assets
│
│── Dockerfile        # Multi-stage Docker setup
│── README.md         # Documentation

```
## 🔄 System Architecture

```mermaid
flowchart TD
    subgraph Frontend [Frontend (React.js)]
        UI[User Interface ]
        SocketClient[Socket.IO Client]
        APIClient[Axios API Client]
    end

    subgraph Backend [Backend (Node.js + Express)]
        Routes[REST API Routes ]
        SocketServer[Socket.IO Server]
        Utils[Utils: Email, PDF, Redis]
    end

    subgraph DB [Database Layer]
        Postgres[(PostgreSQL via Sequelize )]
        Redis[(Redis Cache)]
    end

    subgraph External [External Services]
        SendGrid[SendGrid - Email Service ]
    end

    UI --> APIClient
    UI --> SocketClient

    APIClient --> Routes
    SocketClient --> SocketServer

    Routes --> Postgres
    Routes --> Redis
    SocketServer --> Redis
    SocketServer --> Postgres

    Utils --> SendGrid
    Utils --> Postgres
```
