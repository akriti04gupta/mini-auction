import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  useParams
} from "react-router-dom";
import AuctionPage from "./AuctionPage";
import CreateAuction from "./CreateAuction";
import AdminPanel from "./AdminPanel";
import './App.css'; 

function Home() {
  const navigate = useNavigate();

  const handleAuctionCreated = (id) => {
    navigate(`/auction/${id}`);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif",color:"#14077bff" }}>
      <h1>Welcome to Mini-Auction System!</h1>
      <CreateAuction onAuctionCreated={handleAuctionCreated} />
    </div>
  );
}


function AuctionPageWrapper() {
  const { auctionId } = useParams();
  return <AuctionPage auctionId={auctionId} />;
}

export default function App() {
  return (
    <Router>
      <nav style={{ padding: "20px", borderBottom: "1px solid #ccc", background: "#e7f7ffff" }}>
        <Link to="/" style={{ marginRight: "20px", textDecoration: 'none', color: '#093975ff' }}>
          Home
        </Link>
        <Link to="/admin" style={{ marginRight: "20px", textDecoration: 'none', color: '#093975ff' }}>
          Admin Panel
        </Link>
        <Link to="/auction/:auctionId" style={{ textDecoration: 'none', color: '#093975ff' }}>
          Auction-Page
        </Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auction/:auctionId" element={<AuctionPageWrapper />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Router>
  );
}
