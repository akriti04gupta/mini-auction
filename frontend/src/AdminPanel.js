import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Card, CardContent, Typography, Button, Grid, Stack } from "@mui/material";

const BACKEND_URL = "";

export default function AdminPanel() {
  const [auctions, setAuctions] = useState([]);
  const [error, setError] = useState('');

  const fetchAuctions = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/auction`);
      setAuctions(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch auctions");
    }
  };

  const handleDecision = async (auctionId, decision) => {
    try {
      await axios.post(`${BACKEND_URL}/api/auction/${auctionId}/decision`, { decision });
      alert(`Decision (${decision}) processed successfully!`);
      fetchAuctions(); 
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || `Error processing decision`);
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, []);

  return (
    <Container style={{ marginTop: "40px" , color:"#14077bff"}}>
      <Typography variant="h4" gutterBottom>
       <b>Admin Panel- Manage Auctions</b>
      </Typography>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <Grid container spacing={3}>
        {auctions.map((auction) => (
          <Grid item xs={12} md={6} key={auction.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="#15077ba2">{auction.itemName}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {auction.description}
                </Typography>
                <Typography variant="body1" color="#c13838ea">
                  Status: <strong>{auction.status}</strong>
                </Typography>
                {auction.status === "pending_decision" && (
                  <Stack direction="row" spacing={1} style={{ marginTop: "10px" }}>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => handleDecision(auction.id, 'accept')}
                    >
                      Accept Bid
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleDecision(auction.id, 'reject')}
                    >
                      Reject Bid
                    </Button>
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
