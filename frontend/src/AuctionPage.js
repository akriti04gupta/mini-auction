import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import axios from "axios";
import {
  Container, Card, CardContent, Typography, TextField, Button, Grid, List, ListItem,
  ListItemText, Divider, Stack, Box, Alert, Modal, Checkbox, FormControlLabel, Chip
} from "@mui/material";

const modalStyle = {
  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
  width: 400, bgcolor: 'background.paper', border: '2px solid #000',
  boxShadow: 24, p: 4, borderRadius: 2,
};

const BACKEND_URL = "";

export default function AuctionPage() {
  const { auctionId } = useParams();
  const [auction, setAuction] = useState(null);
  const [bid, setBid] = useState("");
  const [highestBid, setHighestBid] = useState(0);
  const [bidHistory, setBidHistory] = useState([]);
  const [timeLeft, setTimeLeft] = useState("");
  const [isSeller, setIsSeller] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });
  const [counterModal, setCounterModal] = useState({ open: false, price: 0, bidder: '' });
  const [sellerCounterInput, setSellerCounterInput] = useState("");
  const socketRef = useRef(null);
  const timerId = useRef(null);
  const [bidderName] = useState(() => `User_${Math.floor(Math.random() * 1000)}`);

  const calculateTimeLeft = (endTime) => {
    if (!endTime) return "";
    const diff = new Date(endTime) - new Date();
    if (diff <= 0) {
      clearInterval(timerId.current);
      return "0m 0s";
    }
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return `${minutes}m ${seconds}s`;
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: '', message: '' }), 5000);
  };

  useEffect(() => {
    socketRef.current = io(BACKEND_URL, { transports: ["websocket"] });
    const socket = socketRef.current;

    const fetchAuction = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/auction/${auctionId}`);
        const auctionData = res.data;
        setAuction(auctionData);
        const sortedBids = [...(auctionData.Bids || [])].sort((a, b) => b.amount - a.amount);
        setHighestBid(sortedBids.length > 0 ? sortedBids[0].amount : auctionData.startPrice);
        setBidHistory(sortedBids);
        if (auctionData.endTime && new Date(auctionData.endTime) > new Date()) {
          timerId.current = setInterval(() => setTimeLeft(calculateTimeLeft(auctionData.endTime)), 1000);
        }
      } catch (err) {
        showNotification('error', 'Failed to load auction data.');
      }
    };
    fetchAuction();

    socket.emit("joinAuction", auctionId);
    socket.on("highestBid", (amount) => setHighestBid(amount));
    socket.on("newBid", (data) => {
      setHighestBid(data.amount);
      setBidHistory((prev) => [data, ...prev]);
      showNotification('info', `${data.bidder} placed a new bid of ₹${data.amount}!`);
    });
    socket.on("bidError", (msg) => showNotification('error', msg));
    socket.on('decision_required', ({ auctionId: aId }) => {
      if (String(aId) === auctionId) {
        setAuction(prev => ({ ...prev, status: 'pending_decision' }));
        showNotification('warning', 'The auction has ended. The seller must now make a decision.');
      }
    });
    socket.on('seller_decision_made', ({ auctionId: aId, status, finalPrice, winnerId }) => {
      if (String(aId) === auctionId) {
        setAuction(prev => ({ ...prev, status, finalPrice, winnerId }));
        if (status === 'sold') {
          showNotification('success', `Sale Complete! ${winnerId} won for ₹${finalPrice}.`);
        } else {
          showNotification('error', 'The seller closed the auction without a winner.');
        }
      }
    });
    socket.on('counter_offer_received', ({ auctionId: aId, counterPrice, highestBidder }) => {
      if (String(aId) === auctionId && bidderName === highestBidder) {
        setCounterModal({ open: true, price: counterPrice, bidder: highestBidder });
      }
    });

    return () => {
      clearInterval(timerId.current);
      socket.disconnect();
    };
  }, [auctionId, bidderName]);

  const placeBid = () => {
    if (!bid || isNaN(bid)) return showNotification('error', "Please enter a valid bid amount");
    socketRef.current.emit("placeBid", { auctionId, amount: parseFloat(bid), bidder: bidderName });
    setBid("");
  };

  const handleSellerDecision = async (decision) => {
    try {
      const payload = decision === 'counter' ? { decision, counterPrice: Number(sellerCounterInput) } : { decision };
      await axios.post(`${BACKEND_URL}/api/auction/${auctionId}/decision`, payload);
      showNotification('success', `Your decision (${decision}) has been processed.`);
    } catch (e) {
      showNotification('error', e?.response?.data?.error || "An error occurred.");
    }
  };

  const handleCounterResponse = async (response) => {
    try {
      await axios.post(`${BACKEND_URL}/api/auction/${auctionId}/counter-response`, { response });
      setCounterModal({ open: false, price: 0, bidder: '' });
      showNotification('success', `You have ${response}ed the counter offer.`);
    } catch (e) {
      showNotification('error', e?.response?.data?.error || "An error occurred.");
    }
  };

  if (!auction) return <p>Loading auction...</p>;

  const isAuctionOver = !['active', 'pending_decision', 'counter_offered'].includes(auction.status);

  return (
    <Container maxWidth="lg" style={{ marginTop: "40px", marginBottom: "40px" }}>
      {notification.message && <Alert severity={notification.type} sx={{ mb: 2 }}>{notification.message}</Alert>}
      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          <Card elevation={3}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>{auction.itemName}</Typography>
              <Typography variant="body1" color="text.secondary" paragraph>{auction.description}</Typography>
              <Divider sx={{ my: 2 }} />
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h5" color="primary.main" sx={{ fontWeight: 600 }}>Highest Bid: ₹{highestBid}</Typography>
                  <Typography variant="subtitle1" color="text.secondary">Starting Price: ₹{auction.startPrice}</Typography>
                </Box>
                <Chip label={auction.status === 'active' ? `Time Left: ${timeLeft}` : `Status: ${auction.status.replace('_', ' ')}`}
                      color={auction.status === 'active' ? 'error' : 'default'}
                      sx={{ fontSize: '1rem', p: 2, textTransform: 'capitalize' }} />
              </Box>
              <FormControlLabel control={<Checkbox checked={isSeller} onChange={(e) => setIsSeller(e.target.checked)}/>} label="I am the seller (demo)" sx={{ mt: 1 }}/>
            </CardContent>
          </Card>

          {auction.status === 'active' && !isSeller && (
            <Card elevation={3} sx={{ mt: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6">Place Your Bid (as {bidderName})</Typography>
                <TextField fullWidth type="number" value={bid} onChange={(e) => setBid(e.target.value)} placeholder={`Minimum bid: ₹${highestBid + auction.bidIncrement}`} margin="normal" />
                <Button variant="contained" color="primary" fullWidth onClick={placeBid} sx={{ p: 1.5, fontWeight: 'bold' }}>Place Bid</Button>
              </CardContent>
            </Card>
          )}

          {auction.status === 'pending_decision' && isSeller && (
            <Card elevation={3} sx={{ mt: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6">Seller Actions</Typography>
                <Stack spacing={1} direction="row" mt={2}>
                  <Button onClick={() => handleSellerDecision('accept')} variant="contained" color="success">Accept Bid</Button>
                  <Button onClick={() => handleSellerDecision('reject')} variant="contained" color="error">Reject Bid</Button>
                </Stack>
                <Stack spacing={1} direction="row" mt={2} alignItems="center">
                  <TextField type="number" value={sellerCounterInput} onChange={(e) => setSellerCounterInput(e.target.value)} placeholder="Counter price" size="small" />
                  <Button onClick={() => handleSellerDecision('counter')} variant="outlined" color="warning">Send Counter-Offer</Button>
                </Stack>
              </CardContent>
            </Card>
          )}

          {isAuctionOver && (
            <Card elevation={3} sx={{ mt: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6">Auction Concluded</Typography>
                {auction.status === 'sold' ? (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    Winner: {auction.winnerId} <br/> Final Price: ₹{auction.finalPrice}
                  </Alert>
                ) : (
                  <Alert severity="info" sx={{ mt: 2 }}>This auction was closed without a winner.</Alert>
                )}
              </CardContent>
            </Card>
          )}
        </Grid>
        <Grid item xs={12} md={5}>
          <Card elevation={3}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Live Bid History</Typography>
              <List sx={{ maxHeight: 500, overflow: 'auto', p: 0 }}>
                {bidHistory.map((b, index) => (
                  <ListItem key={index} divider sx={{ bgcolor: index === 0 ? '#eef2f7' : 'transparent' }}>
                    <ListItemText primary={`₹${b.amount}`} secondary={`By: ${b.bidder}`}
                                  primaryTypographyProps={{ fontWeight: 'bold' }} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Modal open={counterModal.open} onClose={() => setCounterModal({ ...counterModal, open: false })}>
        <Box sx={modalStyle}>
          <Typography variant="h6" component="h2">Counter Offer Received</Typography>
          <Typography sx={{ mt: 2 }}>The seller has made a counter offer of ₹{counterModal.price}.</Typography>
          <Stack direction="row" spacing={2} mt={3}>
            <Button variant="contained" color="success" onClick={() => handleCounterResponse('accept')}>Accept</Button>
            <Button variant="outlined" color="error" onClick={() => handleCounterResponse('reject')}>Reject</Button>
          </Stack>
        </Box>
      </Modal>
    </Container>
  );
}
