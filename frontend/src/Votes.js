import { useState, useEffect, useContext } from "react";
import { Button, Card, ListGroup, Alert, Spinner, ProgressBar, Form, InputGroup, Badge, Row, Col, Tooltip, OverlayTrigger, Container } from "react-bootstrap";
import { AppContext } from "./App";

const Votes = () => {
  const { contract, connected, isMember, signer } = useContext(AppContext);
  const [votes, setVotes] = useState([]);
  const [filteredVotes, setFilteredVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [votingInProgress, setVotingInProgress] = useState({});
  const [timeRemaining, setTimeRemaining] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // "all", "active", "ended"
  const [animateElements, setAnimateElements] = useState(false);

  // Add animation trigger
  useEffect(() => {
    setTimeout(() => {
      setAnimateElements(true);
    }, 100);
  }, []);

  const fetchIPFSData = async (uri) => {
    try {
      let url;
      if (uri.startsWith("ipfs/")) {
        const cid = uri.replace("ipfs/", "");
        url = `https://gateway.pinata.cloud/ipfs/${cid}`;
      } else if (uri.startsWith("https://")) {
        url = uri;
      } else {
        url = `https://gateway.pinata.cloud/ipfs/${uri}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`IPFS fetch failed: ${response.statusText}`);
      }
      return await response.json();
    } catch (err) {
      console.error("Error fetching IPFS data:", err);
      return null;
    }
  };

  const formatTimeRemaining = (endTime) => {
    const now = Math.floor(Date.now() / 1000) * 1000; // Round to nearest second
    
    if (endTime <= now) {
      return { text: "Voting ended", ended: true };
    }
    
    const totalMs = endTime - now;
    const days = Math.floor(totalMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((totalMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((totalMs % (1000 * 60)) / 1000);
    
    const displayDays = Math.max(0, Math.min(days, 999));
    
    let text = "";
    if (displayDays > 0) {
      text = `${displayDays}d ${hours}h remaining`;
    } else if (hours > 0) {
      text = `${hours}h ${minutes}m remaining`;
    } else if (minutes > 0) {
      text = `${minutes}m ${seconds}s remaining`;
    } else {
      text = `${seconds}s remaining`;
    }
    
    return { 
      days: displayDays, 
      hours, 
      minutes,
      seconds,
      text,
      ended: false,
      timeLeft: totalMs
    };
  };

  useEffect(() => {
    const updateAllTimeRemaining = () => {
      const updatedTimeRemaining = {};
      
      votes.forEach(vote => {
        updatedTimeRemaining[vote.id] = formatTimeRemaining(vote.endTime);
      });
      
      setTimeRemaining(updatedTimeRemaining);
    };
    
    if (votes.length > 0) {
      updateAllTimeRemaining();
    }
    
    const intervalId = setInterval(updateAllTimeRemaining, 1000); // Update every second
    
    return () => clearInterval(intervalId);
  }, [votes]);

  useEffect(() => {
    const fetchVotes = async () => {
      if (!contract || !connected) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const votesData = [];
        const maxVoteId = 30;
        
        for (let i = 0; i < maxVoteId; i++) {
          try {
            const voteData = await contract.getVote(i);
            
            if (voteData && voteData[0] && voteData[0] !== "") {
              let hasVoted = false;
              
              if (signer) {
                const address = await signer.getAddress();
                hasVoted = await contract.didVote(address, i);
              }
              
              let ipfsData = null;
              try {
                ipfsData = await fetchIPFSData(voteData[0]);
              } catch (ipfsError) {
                console.error(`Failed to fetch IPFS data for vote ${i}:`, ipfsError);
              }
              
              const endTimeSeconds = Number(voteData[3]);
              
              // Convert to milliseconds for consistent handling
              const endTimeMs = endTimeSeconds * 1000;
              
              votesData.push({
                id: i,
                uri: voteData[0],
                owner: voteData[1],
                votes: voteData[2].map(v => Number(v)),
                endTime: endTimeMs,
                hasVoted: hasVoted,
                ipfsData: ipfsData 
              });
            }
          } catch (err) {
            console.log(`Vote ${i} doesn't exist or can't be fetched`);
          }
        }
        
        votesData.sort((a, b) => b.id - a.id);
        
        setVotes(votesData);
        setFilteredVotes(votesData);
      } catch (err) {
        console.error("Error fetching votes:", err);
        setError("Failed to load votes: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (connected && contract) {
      fetchVotes();
    } else {
      setLoading(false);
    }
  }, [contract, connected, signer]);

  // Filter and search functionality
  useEffect(() => {
    let filtered = [...votes];
    
    // Apply status filter
    if (filterStatus === "active") {
      filtered = filtered.filter(vote => vote.endTime > Date.now());
    } else if (filterStatus === "ended") {
      filtered = filtered.filter(vote => vote.endTime <= Date.now());
    }
    
    // Apply search term filter if it exists
    if (searchTerm.trim() !== "") {
      const lowercasedSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(vote => {
        // Search by ID
        if (vote.id.toString().includes(lowercasedSearch)) {
          return true;
        }
        
        // Search by URI
        if (vote.uri.toLowerCase().includes(lowercasedSearch)) {
          return true;
        }
        
        // Search by owner address
        if (vote.owner.toLowerCase().includes(lowercasedSearch)) {
          return true;
        }
        
        // Search by IPFS data description if available
        if (vote.ipfsData && vote.ipfsData.description && 
            vote.ipfsData.description.toLowerCase().includes(lowercasedSearch)) {
          return true;
        }
        
        // Search by options if available
        if (vote.ipfsData && vote.ipfsData.options) {
          return vote.ipfsData.options.some(option => 
            option.toLowerCase().includes(lowercasedSearch)
          );
        }
        
        return false;
      });
    }
    
    setFilteredVotes(filtered);
  }, [searchTerm, votes, filterStatus]);

  const handleVote = async (voteId, option) => {
    if (!contract) {
      alert("Please connect to MetaMask first");
      return;
    }
    
    if (!isMember) {
      alert("You need to become a member first");
      return;
    }
    
    setVotingInProgress(prev => ({
      ...prev,
      [`${voteId}-${option}`]: true
    }));

    try {
      const vote = votes.find(v => v.id === voteId);
      if (vote && vote.endTime < Date.now()) {
        alert("Voting has ended for this proposal");
        return;
      }

      if (signer) {
        const address = await signer.getAddress();
        const hasVoted = await contract.didVote(address, voteId);
        
        if (hasVoted) {
          alert("You have already voted on this proposal");
          return;
        }
      }

      const tx = await contract.vote(voteId, option);
      await tx.wait(); 
      
      alert("Vote cast successfully!");
      
      const voteData = await contract.getVote(voteId);
      const updatedVotes = [...votes];
      const voteIndex = updatedVotes.findIndex(v => v.id === voteId);
      
      if (voteIndex !== -1) {
        updatedVotes[voteIndex] = {
          ...updatedVotes[voteIndex],
          votes: voteData[2].map(v => Number(v)),
          hasVoted: true
        };
        setVotes(updatedVotes);
      }
    } catch (err) {
      console.error("Error voting:", err);
      alert("Failed to vote: " + err.message);
    } finally {
      // Clear voting in progress state
      setVotingInProgress(prev => ({
        ...prev,
        [`${voteId}-${option}`]: false
      }));
    }
  };

  const calculateTotalVotes = (voteArray) => {
    return voteArray.reduce((total, count) => total + count, 0);
  };

  // Truncate wallet address for display
  const truncateAddress = (address) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <>
      {/* Custom CSS for votes page */}
      <style>
        {`
          .vote-card {
            border-radius: 16px;
            overflow: hidden;
            border: none;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            background: rgba(30, 30, 40, 0.8);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.05);
            margin-bottom: 1.5rem;
          }
          
          .vote-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
            border-color: rgba(255, 255, 255, 0.1);
          }
          
          .vote-header {
            background: linear-gradient(90deg, rgba(55, 55, 75, 0.7), rgba(35, 35, 55, 0.7));
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            padding: 1.25rem;
          }
          
          .vote-body {
            padding: 1.5rem;
          }
          
          .vote-option {
            background-color: rgba(25, 25, 35, 0.5);
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.05);
            padding: 1rem;
            margin-bottom: 1rem;
            transition: all 0.2s ease;
            position: relative;
            overflow: hidden;
          }
          
          .vote-option:hover {
            background-color: rgba(35, 35, 45, 0.7);
            border-color: rgba(255, 255, 255, 0.1);
          }
          
          .vote-option.winning {
            border-color: rgba(25, 135, 84, 0.5);
            background-color: rgba(25, 135, 84, 0.1);
          }
          
          .vote-option::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle at center, rgba(255, 255, 255, 0.1), transparent 70%);
            opacity: 0;
            transition: opacity 0.3s ease;
          }
          
          .vote-option:hover::before {
            opacity: 1;
          }
          
          .progress {
            height: 10px;
            border-radius: 5px;
            background-color: rgba(255, 255, 255, 0.1);
            overflow: hidden;
          }
          
          .progress-bar {
            border-radius: 5px;
            transition: width 0.6s ease;
          }
          
          .vote-button {
            border-radius: 50px;
            padding: 0.4rem 1.2rem;
            transition: all 0.2s ease;
            font-weight: 500;
            letter-spacing: 0.5px;
            border: none;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          
          .vote-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
          }
          
          .vote-button:active {
            transform: translateY(0);
          }
          
          .search-container {
            background: rgba(30, 30, 40, 0.6);
            border-radius: 16px;
            padding: 1.5rem;
            margin-bottom: 2rem;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
          }
          
          .filter-badges .badge {
            cursor: pointer;
            margin-right: 0.5rem;
            padding: 0.5rem 1rem;
            font-size: 0.85rem;
            border-radius: 50px;
            transition: all 0.2s ease;
            opacity: 0.7;
            border: 1px solid transparent;
          }
          
          .filter-badges .badge:hover {
            opacity: 0.9;
            transform: translateY(-1px);
          }
          
          .filter-badges .badge.active {
            opacity: 1;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            border-color: rgba(255, 255, 255, 0.1);
          }
          
          .search-input {
            background-color: rgba(20, 20, 30, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            color: white;
            padding: 0.75rem 1rem;
            font-size: 1rem;
            transition: all 0.2s ease;
          }
          
          .search-input:focus {
            background-color: rgba(30, 30, 40, 0.8);
            border-color: rgba(105, 65, 198, 0.6);
            box-shadow: 0 0 0 0.25rem rgba(105, 65, 198, 0.25);
          }
          
          .search-input::placeholder {
            color: rgba(255, 255, 255, 0.5);
          }
          
          .section-header {
            position: relative;
            margin-bottom: 2.5rem;
            padding-bottom: 1rem;
          }
          
          .section-header::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 80px;
            height: 4px;
            background: linear-gradient(90deg, #6941c6, #9d66ff);
            border-radius: 2px;
          }
          
          .vote-meta {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          }
          
          .vote-meta-item {
            display: flex;
            align-items: center;
            margin-right: 1.5rem;
            margin-bottom: 0.5rem;
            color: rgba(255, 255, 255, 0.7);
            font-size: 0.9rem;
          }
          
          .vote-meta-item svg,
          .vote-meta-item i {
            margin-right: 0.5rem;
            color: rgba(255, 255, 255, 0.5);
          }
          
          .votes-empty-state {
            text-align: center;
            padding: 4rem 2rem;
            background: rgba(30, 30, 40, 0.6);
            border-radius: 16px;
            margin-top: 2rem;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
            border: 1px solid rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
          }
          
          .votes-empty-icon {
            font-size: 3.5rem;
            color: rgba(105, 65, 198, 0.7);
            margin-bottom: 1.5rem;
          }
          
          .winner-badge {
            position: absolute;
            top: -10px;
            left: 10px;
            z-index: 10;
            padding: 0.35rem 0.75rem;
            font-weight: 600;
            letter-spacing: 0.5px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
          }
          
          .progress-vote-count {
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 0.75rem;
            color: rgba(255, 255, 255, 0.9);
            font-weight: bold;
            text-shadow: 0 0 3px rgba(0, 0, 0, 0.5);
          }
          
          .pulse-animation {
            animation: pulse 2s infinite;
          }
          
          @keyframes pulse {
            0% {
              opacity: 0.6;
            }
            50% {
              opacity: 1;
            }
            100% {
              opacity: 0.6;
            }
          }
          
          .vote-card-glow {
            position: absolute;
            bottom: -50px;
            right: -50px;
            width: 200px;
            height: 200px;
            background: radial-gradient(circle at center, rgba(105, 65, 198, 0.15) 0%, transparent 70%);
            border-radius: 50%;
            z-index: 0;
            pointer-events: none;
          }
          
          .animate-in {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.6s ease-out, transform 0.6s ease-out;
          }
          
          .animate-in.show {
            opacity: 1;
            transform: translateY(0);
          }
          
          .animate-in-delay-1 {
            transition-delay: 0.2s;
          }
          
          .animate-in-delay-2 {
            transition-delay: 0.4s;
          }
          
          .animate-in-delay-3 {
            transition-delay: 0.6s;
          }
          
          .badge {
            padding: 0.5rem 0.75rem;
            font-weight: 500;
            letter-spacing: 0.5px;
          }
          
          .page-title {
            background: linear-gradient(90deg, #fff, #d9c8ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-weight: 700;
          }
          
          .vote-header h4 {
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;
          }
          
          @media (max-width: 768px) {
            .vote-meta {
              flex-direction: column;
              align-items: flex-start;
            }
            
            .vote-meta-item {
              margin-bottom: 0.5rem;
            }
          }
        `}
      </style>

      <div className="particle-container"></div>
      
      <Container className="py-5">
        <div className={`section-header animate-in ${animateElements ? 'show' : ''}`}>
          <Badge bg="primary" className="mb-2">Blockchain Governance</Badge>
          <h2 className="page-title display-5 mb-2">Community Voting</h2>
          <p className="text-light opacity-75">Participate in transparent and secure voting on the Ethereum blockchain</p>
        </div>
        
        {!connected ? (
          <div className={`votes-empty-state animate-in ${animateElements ? 'show' : ''}`}>
            <div className="votes-empty-icon">
              <i className="bi bi-lock-fill"></i>
            </div>
            <h4>Connect Your Wallet to Vote</h4>
            <p className="text-light opacity-75 mb-4">
              Connect your Ethereum wallet to view active proposals and participate in voting
            </p>
          </div>
        ) : loading ? (
          <div className={`text-center my-5 animate-in ${animateElements ? 'show' : ''}`}>
            <div className="mb-4">
              <Spinner animation="border" role="status" style={{ width: '3rem', height: '3rem' }} className="text-primary">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
            <h5 className="text-light opacity-75">Loading votes from blockchain...</h5>
          </div>
        ) : error ? (
          <div className={`animate-in ${animateElements ? 'show' : ''}`}>
            <Alert variant="danger" className="d-flex align-items-center">
              <div className="me-3 fs-3">
                <i className="bi bi-x-circle-fill"></i>
              </div>
              <div>
                <h5>Error Loading Votes</h5>
                <p className="mb-2">{error}</p>
                <Button 
                  variant="outline-light" 
                  className="mt-2" 
                  onClick={() => window.location.reload()}
                >
                  <i className="bi bi-arrow-clockwise me-2"></i> Try Again
                </Button>
              </div>
            </Alert>
          </div>
        ) : (
          <>
            {/* Search and Filter Section */}
            <div className={`search-container animate-in ${animateElements ? 'show' : ''}`}>
              <Row className="align-items-center">
                <Col lg={6} className="mb-3 mb-lg-0">
                  <InputGroup className="mb-3">
                    <InputGroup.Text className="bg-dark border-0">
                      <i className="bi bi-search"></i>
                    </InputGroup.Text>
                    <Form.Control
                      placeholder="Search by title, options, or creator address..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-input"
                    />
                    {searchTerm && (
                      <Button 
                        variant="outline-secondary" 
                        onClick={() => setSearchTerm("")}
                      >
                        <i className="bi bi-x-circle-fill"></i>
                      </Button>
                    )}
                  </InputGroup>
                </Col>
                <Col lg={6}>
                  <div className="filter-badges">
                    <Badge 
                      bg={filterStatus === "all" ? "primary" : "dark"} 
                      className={`${filterStatus === "all" ? 'active' : ''}`}
                      onClick={() => setFilterStatus("all")}
                    >
                      <i className="bi bi-filter-circle-fill me-1"></i> All Votes
                    </Badge>
                    <Badge 
                      bg={filterStatus === "active" ? "success" : "dark"} 
                      className={`${filterStatus === "active" ? 'active' : ''}`}
                      onClick={() => setFilterStatus("active")}
                    >
                      <i className="bi bi-unlock-fill me-1"></i> Active Votes
                    </Badge>
                    <Badge 
                      bg={filterStatus === "ended" ? "danger" : "dark"} 
                      className={`${filterStatus === "ended" ? 'active' : ''}`}
                      onClick={() => setFilterStatus("ended")}
                    >
                      <i className="bi bi-lock-fill me-1"></i> Ended Votes
                    </Badge>
                  </div>
                </Col>
              </Row>
            </div>
            
            {/* Votes Display */}
            {votes.length === 0 ? (
              <div className={`votes-empty-state animate-in animate-in-delay-1 ${animateElements ? 'show' : ''}`}>
                <div className="votes-empty-icon">
                  <i className="bi bi-info-circle-fill"></i>
                </div>
                <h4>No Votes Available</h4>
                <p className="text-light opacity-75 mb-4">
                  Be the first to create a vote for the community!
                </p>
              </div>
            ) : filteredVotes.length === 0 ? (
              <div className={`votes-empty-state animate-in animate-in-delay-1 ${animateElements ? 'show' : ''}`}>
                <div className="votes-empty-icon">
                  <i className="bi bi-search"></i>
                </div>
                <h4>No Matches Found</h4>
                <p className="text-light opacity-75 mb-4">
                  No votes match your current search criteria
                </p>
                <Button 
                  variant="outline-primary" 
                  onClick={() => {
                    setSearchTerm("");
                    setFilterStatus("all");
                  }}
                >
                  <i className="bi bi-arrow-clockwise me-2"></i> Reset Filters
                </Button>
              </div>
            ) : (
              <Row>
                {filteredVotes.map((vote, voteIndex) => {
                  const votingEnded = vote.endTime < Date.now();
                  const totalVotes = calculateTotalVotes(vote.votes);
                  const remaining = timeRemaining[vote.id] || formatTimeRemaining(vote.endTime);
                  const winningOptionIndex = vote.votes.indexOf(Math.max(...vote.votes));
                  
                  return (
                    <Col lg={12} key={vote.id}>
                      <Card className={`vote-card position-relative animate-in animate-in-delay-${voteIndex % 3 + 1} ${animateElements ? 'show' : ''}`}>
                        <div className="vote-card-glow"></div>
                        
                        <Card.Header className="vote-header">
                          <Row className="align-items-center">
                            <Col md={7}>
                              <div className="d-flex align-items-center">
                                <Badge bg="dark" className="me-3 p-2">
                                  #{vote.id}
                                </Badge>
                                <h4 className="mb-0">
                                  {vote.ipfsData && vote.ipfsData.description 
                                    ? vote.ipfsData.description 
                                    : `Topic: ${vote.uri}`}
                                </h4>
                              </div>
                            </Col>
                            <Col md={5} className="text-md-end mt-3 mt-md-0">
                              <Badge 
                                bg={votingEnded ? 'danger' : 'success'} 
                                className="me-2 p-2"
                              >
                                {votingEnded 
                                  ? <><i className="bi bi-lock-fill me-1"></i> Voting Ended</>
                                  : <><i className="bi bi-unlock-fill me-1"></i> Voting Active</>
                                }
                              </Badge>
                              
                              {!votingEnded && (
                                <Badge bg="info" className={`p-2 ${remaining.days === 0 && remaining.hours < 12 ? 'pulse-animation' : ''}`}>
                                  <i className="bi bi-clock me-1"></i>
                                  {remaining.text}
                                </Badge>
                              )}
                            </Col>
                          </Row>
                        </Card.Header>
                        
                        <Card.Body className="vote-body">
                          <div className="vote-meta">
                            <div className="vote-meta-item">
                              <i className="bi bi-person-fill"></i>
                              <OverlayTrigger
                                placement="top"
                                overlay={<Tooltip>{vote.owner}</Tooltip>}
                              >
                                <span>Created by: {truncateAddress(vote.owner)}</span>
                              </OverlayTrigger>
                            </div>
                            
                            <div className="vote-meta-item">
                              <i className="bi bi-check-circle-fill"></i>
                              <span>Total Votes: <strong>{totalVotes}</strong></span>
                            </div>
                            
                            {vote.hasVoted && (
                              <Badge bg="secondary" className="p-2">
                                <i className="bi bi-check-lg me-1"></i>
                                You have voted
                              </Badge>
                            )}
                          </div>
                          
                          <div className="mb-4">
                          {vote.votes.map((count, index) => {
                              const optionLabel = vote.ipfsData && vote.ipfsData.options && vote.ipfsData.options[index]
                                ? vote.ipfsData.options[index]
                                : `Option ${index + 1}`;
                              
                              const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                              const isWinningOption = index === winningOptionIndex && count > 0;
                              
                              return (
                                <div 
                                  key={index} 
                                  className={`vote-option position-relative ${isWinningOption ? 'winning' : ''}`}
                                >
                                  {votingEnded && isWinningOption && (
                                    <Badge bg="success" className="winner-badge">
                                      <i className="bi bi-trophy-fill me-1"></i> Winner
                                    </Badge>
                                  )}
                                  
                                  <div className="d-flex justify-content-between mb-2">
                                    <div className="fw-bold mb-1">{optionLabel}</div>
                                    <div>
                                      <strong>{count}</strong> {count === 1 ? 'vote' : 'votes'} ({percentage}%)
                                    </div>
                                  </div>
                                  
                                  <div className="position-relative mb-3">
                                    <ProgressBar 
                                      variant={isWinningOption ? "success" : count === 0 ? "secondary" : "info"} 
                                      now={percentage > 0 ? percentage : 3} 
                                      className="mb-0"
                                    />
                                    {percentage > 10 && (
                                      <span className="progress-vote-count">{percentage}%</span>
                                    )}
                                  </div>
                                  
                                  {!votingEnded && !vote.hasVoted && isMember && (
                                    <div className="text-end">
                                      <Button 
                                        size="sm" 
                                        variant={votingInProgress[`${vote.id}-${index}`] ? "outline-secondary" : "outline-primary"}
                                        onClick={() => handleVote(vote.id, index)}
                                        disabled={votingInProgress[`${vote.id}-${index}`]}
                                        className="vote-button"
                                      >
                                        {votingInProgress[`${vote.id}-${index}`] ? (
                                          <>
                                            <Spinner
                                              as="span"
                                              animation="border"
                                              size="sm"
                                              role="status"
                                              aria-hidden="true"
                                              className="me-1"
                                            />
                                            Voting...
                                          </>
                                        ) : (
                                          <>
                                            <i className="bi bi-check-circle-fill me-1"></i>
                                            Cast Vote
                                          </>
                                        )}
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          
                          {votingEnded && totalVotes > 0 && winningOptionIndex !== -1 && (
                            <Alert variant="success" className="d-flex align-items-center mb-0">
                              <div className="me-3 fs-4">
                                <i className="bi bi-trophy-fill"></i>
                              </div>
                              <div>
                                <strong>Final Result:</strong> {
                                  vote.ipfsData && vote.ipfsData.options && vote.ipfsData.options[winningOptionIndex]
                                    ? vote.ipfsData.options[winningOptionIndex]
                                    : `Option ${winningOptionIndex + 1}`
                                } won with {vote.votes[winningOptionIndex]} {vote.votes[winningOptionIndex] === 1 ? 'vote' : 'votes'} 
                                ({Math.round((vote.votes[winningOptionIndex] / totalVotes) * 100)}%)
                              </div>
                            </Alert>
                          )}
                          
                          {!isMember && !votingEnded && (
                            <Alert variant="info" className="mb-0 mt-3">
                              <i className="bi bi-info-circle-fill me-2"></i>
                              You need to become a member to participate in voting
                            </Alert>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            )}
            
            {/* Load More Button (optional, if needed) */}
            {filteredVotes.length > 0 && filteredVotes.length >= 5 && (
              <div className={`text-center mt-4 animate-in animate-in-delay-3 ${animateElements ? 'show' : ''}`}>
                <Button variant="outline-light" className="px-4 py-2">
                  <i className="bi bi-arrow-down-circle me-2"></i>
                  Load More Votes
                </Button>
              </div>
            )}
          </>
        )}
      </Container>
    </>
  );
};

export default Votes;