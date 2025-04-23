import { useState, useEffect, useContext } from "react";
import { Button, Card, ListGroup, Alert, Spinner, ProgressBar, Form, InputGroup, Badge, Row, Col, Tooltip, OverlayTrigger } from "react-bootstrap";
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

  if (!connected) {
    return (
      <div className="text-center my-5">
        <Alert variant="warning">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Please connect your wallet to view votes
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" role="status" className="mb-3">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p>Loading votes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-3">
        <Alert variant="danger">
          <i className="bi bi-exclamation-circle me-2"></i>
          {error}
        </Alert>
        <Button 
          variant="primary" 
          className="mt-2" 
          onClick={() => window.location.reload()}
        >
          <i className="bi bi-arrow-clockwise me-1"></i>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="my-4">
      <h2 className="text-center mb-4">Available Votes</h2>
      
      <Row className="mb-4">
        <Col md={8}>
          {/* Search Bar */}
          <Form.Group>
            <InputGroup>
              <InputGroup.Text>
                <i className="bi bi-search"></i>
              </InputGroup.Text>
              <Form.Control
                placeholder="Search by ID, description, options..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <Button 
                  variant="outline-secondary" 
                  onClick={() => setSearchTerm("")}
                >
                  Clear
                </Button>
              )}
            </InputGroup>
          </Form.Group>
        </Col>
        <Col md={4}>
          {/* Status Filter */}
          <Form.Group>
            <InputGroup>
              <InputGroup.Text>
                <i className="bi bi-filter"></i>
              </InputGroup.Text>
              <Form.Select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Votes</option>
                <option value="active">Active Votes</option>
                <option value="ended">Ended Votes</option>
              </Form.Select>
            </InputGroup>
          </Form.Group>
        </Col>
      </Row>
      
      {votes.length === 0 ? (
        <div className="text-center my-5">
          <Alert variant="info">
            <i className="bi bi-info-circle me-2"></i>
            No votes available. Create one!
          </Alert>
        </div>
      ) : filteredVotes.length === 0 ? (
        <Alert variant="info">
          <i className="bi bi-info-circle me-2"></i>
          No votes match your search criteria.
        </Alert>
      ) : (
        filteredVotes.map((vote) => {
          const votingEnded = vote.endTime < Date.now();
          const totalVotes = calculateTotalVotes(vote.votes);
          const remaining = timeRemaining[vote.id] || formatTimeRemaining(vote.endTime);
          const winningOptionIndex = vote.votes.indexOf(Math.max(...vote.votes));
          
          return (
            <Card key={vote.id} className="mb-4 shadow-sm">
              <Card.Header className="bg-light">
                <Row>
                  <Col md={7}>
                    <h5>
                      <Badge bg="secondary" className="me-2">#{vote.id}</Badge>
                      {vote.ipfsData && vote.ipfsData.description 
                        ? vote.ipfsData.description 
                        : `Topic: ${vote.uri}`}
                    </h5>
                  </Col>
                  <Col md={5} className="text-md-end">
                    <Badge bg={votingEnded ? 'danger' : 'success'} className="me-2">
                      <i className={`bi ${votingEnded ? 'bi-lock' : 'bi-unlock'} me-1`}></i>
                      {votingEnded ? 'Voting Ended' : 'Voting Active'}
                    </Badge>
                    
                    {!votingEnded && (
                      <Badge bg="info">
                        <i className="bi bi-clock me-1"></i>
                        {remaining.text}
                      </Badge>
                    )}
                  </Col>
                </Row>
              </Card.Header>
              
              <Card.Body>
                <div className="mb-3">
                  <small className="text-muted">
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip>{vote.owner}</Tooltip>}
                    >
                      <span>
                        <i className="bi bi-person me-1"></i>
                        Created by: {truncateAddress(vote.owner)}
                      </span>
                    </OverlayTrigger>
                    
                    <span className="ms-3">
                      <i className="bi bi-check-circle me-1"></i>
                      Total Votes: <strong>{totalVotes}</strong>
                    </span>
                    
                    {vote.hasVoted && (
                      <Badge bg="secondary" className="ms-3">
                        <i className="bi bi-check2 me-1"></i>
                        You voted
                      </Badge>
                    )}
                  </small>
                </div>
                
                <ListGroup className="mb-3">
                  {vote.votes.map((count, index) => {
                    const optionLabel = vote.ipfsData && vote.ipfsData.options && vote.ipfsData.options[index]
                      ? vote.ipfsData.options[index]
                      : `Option ${index + 1}`;
                    
                    const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                    
                    let variant = "info";
                    if (index === winningOptionIndex && count > 0) {
                      variant = "success"; 
                    } else if (count === 0) {
                      variant = "secondary"; 
                    }
                      
                    return (
                      <ListGroup.Item key={index} className={index === winningOptionIndex && count > 0 ? "border-success" : ""}>
                        <div className="mb-1 d-flex justify-content-between">
                          <span className="fw-bold">
                            {index === winningOptionIndex && count > 0 && <i className="bi bi-trophy text-success me-1"></i>}
                            {optionLabel}
                          </span>
                          <span>
                            <strong>{count}</strong> votes ({percentage}%)
                          </span>
                        </div>
                        
                        <div className="d-flex align-items-center">
                          <div className="flex-grow-1 me-2">
                            <ProgressBar 
                              variant={variant} 
                              now={percentage} 
                              label={`${percentage}%`} 
                              className="mb-2"
                              style={{ height: '25px' }}
                            />
                          </div>
                          
                          <div>
                            {!votingEnded && !vote.hasVoted && isMember && (
                              <Button 
                                size="sm" 
                                variant="outline-success" 
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
                                    />
                                    <span className="ms-1">Voting...</span>
                                  </>
                                ) : (
                                  <>
                                    <i className="bi bi-check-circle me-1"></i>
                                    Vote
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      </ListGroup.Item>
                    );
                  })}
                </ListGroup>
                
                {votingEnded && totalVotes > 0 && (
                  <Alert variant="success" className="mb-0">
                    <i className="bi bi-trophy me-2"></i>
                    <strong>Winning option:</strong> {
                      vote.ipfsData && vote.ipfsData.options && vote.ipfsData.options[winningOptionIndex]
                        ? vote.ipfsData.options[winningOptionIndex]
                        : `Option ${winningOptionIndex + 1}`
                    } with {vote.votes[winningOptionIndex]} votes
                  </Alert>
                )}
              </Card.Body>
            </Card>
          );
        })
      )}

      {/* Additional UI for when there are no votes matching filters */}
      {votes.length > 0 && filteredVotes.length === 0 && (
        <div className="text-center my-4">
          <Button 
            variant="outline-primary" 
            onClick={() => {
              setSearchTerm("");
              setFilterStatus("all");
            }}
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default Votes;