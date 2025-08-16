import { io } from "socket.io-client";

const socket = io(); 

export const listenAuctionEvents = () => {
  socket.on("newBid", ({ amount, bidder }) => {
    showToast(`🔔 New bid: ₹${amount} by ${bidder}`);
  });

  socket.on("notify", ({ type, message }) => {
    if (type === "outbid") showToast(message);
  });

  socket.on("auction-won", ({ auctionId, amount }) => {
    showToast(` You won auction #${auctionId} with ₹${amount}!`);
  });

  socket.on("bid-accepted", ({ auctionId, amount }) => {
    showToast(
      `Your bid of ₹${amount} for auction #${auctionId} was accepted!`
    );
  });

  socket.on("bid-rejected", ({ auctionId }) => {
    showToast(`Your bid for auction #${auctionId} was rejected.`);
  });
};

const showToast = (message) => {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerText = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 5000);
};

export { socket };
