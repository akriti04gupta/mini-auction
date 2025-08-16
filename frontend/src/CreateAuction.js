import React, { useState } from "react";
import axios from "axios";
import {
  Container,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Grid
} from "@mui/material";

const BACKEND_URL = "";

export default function CreateAuction({ onAuctionCreated }) {
  const [form, setForm] = useState({
    itemName: "",
    description: "",
    startPrice: "",
    bidIncrement: "",
    goLiveTime: "",
    durationMinutes: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${BACKEND_URL}/api/auction`, form);
      alert("Auction Created! ID: " + res.data.id);
      onAuctionCreated(res.data.id);
    } catch (err) {
      console.error("Error creating auction:", err);
      alert("Error creating auction");
    }
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: "40px" }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Create a New Auction
          </Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Item Name"
                  name="itemName"
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Starting Price"
                  name="startPrice"
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Bid Increment"
                  name="bidIncrement"
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="datetime-local"
                  label="Go Live Time"
                  name="goLiveTime"
                  InputLabelProps={{ shrink: true }}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="number"
                  label="Duration (Minutes)"
                  name="durationMinutes"
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                >
                  Create Auction
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}
