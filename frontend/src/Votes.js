import { useState, useEffect, useContext } from "react";
import { Button, Card, ListGroup, Alert, Spinner, ProgressBar } from "react-bootstrap";
import { AppContext } from "./App";

const Votes = () => {
  const { contract, connected, isMember, signer } = useContext(AppContext);
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [votingInProgress, setVotingInProgress] = useState({});
  const [timeRemaining, setTimeRemaining] = useState({});

  // Helper function to fetch data from IPFS
  const fetchIPFSData = async (uri) => {
    try {
      // Handle different IPFS URI formats
      let url;
      if (uri.startsWith("ipfs/")) {
        // Convert IPFS URI to an HTTP gateway URL
        const cid = uri.replace("ipfs/", "");
        url = `https://gateway.pinata.cloud/ipfs/${cid}`;
      } else if (uri.startsWith("https://")) {
        // Already a URL
        url = uri;
      } else {
        // Assume it's a CID directly
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

  // Format date as string showing time remaining
  const formatTimeRemaining = (endTime) => {
    const now = Date.now();
    
    // Check if end time is reasonable (less than 10 years in the future)
    // This handles potential errors in timestamp conversion
    const maxReasonableTime = now + (10 * 365 * 24 * 60 * 60 * 1000); // 10 years in ms
    
    if (endTime > maxReasonableTime || endTime <= now) {
      return { text: endTime <= now ? "Voting ended" : "Time calculation error" };
    }
    
    const totalMs = endTime - now;
    const days = Math.floor(totalMs / (1000 * 60 * 60 * 24));
    
    // Cap days at 999 for display purposes
    const displayDays = Math.min(days, 999);
    
    const hours = Math.floor((totalMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return { 
      days: displayDays, 
      hours, 
      minutes,
      text: displayDays > 0 
        ? `${displayDays}d ${hours}h remaining` 
        : hours > 0 
          ? `${hours}h ${minutes}m remaining` 
          : `${minutes}m remaining`
    };
  };

  // Calculate remaining time for each active vote
  useEffect(() => {
    const updateAllTimeRemaining = () => {
      const updatedTimeRemaining = {};
      
      votes.forEach(vote => {
        updatedTimeRemaining[vote.id] = formatTimeRemaining(vote.endTime);
      });
      
      setTimeRemaining(updatedTimeRemaining);
    };
    
    // Initial calculation
    if (votes.length > 0) {
      updateAllTimeRemaining();
    }
    
    // Set interval for updating
    const intervalId = setInterval(updateAllTimeRemaining, 60000); // Update every minute
    
    return () => clearInterval(intervalId);
  }, [votes]);

  // Fetch votes whenever contract or connected status changes
  useEffect(() => {
    const fetchVotes = async () => {
      if (!contract || !connected) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Try to find votes by ID
        // Looking at IDs from 0 to 30 (arbitrary limit)
        const votesData = [];
        const maxVoteId = 30;
        
        for (let i = 0; i < maxVoteId; i++) {
          try {
            const voteData = await contract.getVote(i);
            
            // Check if this is a valid vote (non-empty URI)
            if (voteData && voteData[0] && voteData[0] !== "") {
              // Check if user has voted
              let hasVoted = false;
              
              if (signer) {
                const address = await signer.getAddress();
                hasVoted = await contract.didVote(address, i);
              }
              
              // Fetch the actual data from IPFS
              let ipfsData = null;
              try {
                ipfsData = await fetchIPFSData(voteData[0]);
              } catch (ipfsError) {
                console.error(`Failed to fetch IPFS data for vote ${i}:`, ipfsError);
              }
              
              const endTimeSeconds = Number(voteData[3]);
              
              // Validate end time - ensure it's a reasonable timestamp
              // If timestamp appears to be too large, try to interpret it differently
              let endTimeMs;
              
              if (endTimeSeconds > 253402300800) { // Beyond year 9999
                console.warn(`End time for vote ${i} seems invalid: ${endTimeSeconds}`);
                endTimeMs = Date.now() + (7 * 24 * 60 * 60 * 1000); // Default to 7 days from now
              } else {
                endTimeMs = endTimeSeconds * 1000; // Convert to milliseconds
              }
              
              votesData.push({
                id: i,
                uri: voteData[0],
                owner: voteData[1],
                votes: voteData[2].map(v => Number(v)),
                endTime: endTimeMs,
                hasVoted: hasVoted,
                ipfsData: ipfsData // Add the IPFS data to the vote object
              });
            }
          } catch (err) {
            // Just skip this vote ID
            console.log(`Vote ${i} doesn't exist or can't be fetched`);
          }
        }
        
        // Sort votes by ID in descending order (newest first)
        votesData.sort((a, b) => b.id - a.id);
        
        setVotes(votesData);
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

  const handleVote = async (voteId, option) => {
    if (!contract) {
      alert("Please connect to MetaMask first");
      return;
    }
    
    if (!isMember) {
      alert("You need to become a member first");
      return;
    }
    
    // Set voting in progress for this vote ID and option
    setVotingInProgress(prev => ({
      ...prev,
      [`${voteId}-${option}`]: true
    }));

    try {
      // Check if voting has ended
      const vote = votes.find(v => v.id === voteId);
      if (vote && vote.endTime < Date.now()) {
        alert("Voting has ended for this proposal");
        return;
      }

      // Check if user has already voted
      if (signer) {
        const address = await signer.getAddress();
        const hasVoted = await contract.didVote(address, voteId);
        
        if (hasVoted) {
          alert("You have already voted on this proposal");
          return;
        }
      }

      // Cast vote
      const tx = await contract.vote(voteId, option);
      await tx.wait(); // Wait for transaction to be mined
      
      alert("Vote cast successfully!");
      

      // Update local state
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

  // Calculate total votes for a vote
  const calculateTotalVotes = (voteArray) => {
    return voteArray.reduce((total, count) => total + count, 0);
  };

  if (!connected) {
    return (
      <div className="text-center my-5">
        <Alert variant="warning">
          Please connect to MetaMask to view votes
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading votes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-3">
        <Alert variant="danger">{error}</Alert>
        <Button 
          variant="primary" 
          className="mt-2" 
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  if (votes.length === 0) {
    return (
      <div className="text-center my-5">
        <Alert variant="info">
          No votes available. Create one!
        </Alert>
      </div>
    );
  }

  return (
    <div className="my-4">
      <h2 className="text-center mb-4">Available Votes</h2>
      {votes.map((vote) => {
        const votingEnded = vote.endTime < Date.now();
        const totalVotes = calculateTotalVotes(vote.votes);
        
        return (
          <Card key={vote.id} className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div>
                <h5>Vote #{vote.id}</h5>
                <small>Created by: {vote.owner}</small>
              </div>
              <div className="text-end">
                <span className={`badge ${votingEnded ? 'bg-danger' : 'bg-success'}`}>
                  {votingEnded ? 'Voting Ended' : 'Voting Active'}
                </span>
                <div className="mt-1">
                  {timeRemaining[vote.id]?.text && (
                    <span className="badge bg-info">
                      <i className="bi bi-clock me-1"></i>
                      {timeRemaining[vote.id].text}
                    </span>
                  )}
                </div>
              </div>
            </Card.Header>
            
            <Card.Body>
              <Card.Title className="mb-3">
                {vote.ipfsData && vote.ipfsData.description 
                  ? vote.ipfsData.description 
                  : `Topic: ${vote.uri}`}
              </Card.Title>
              
              <div className="mb-3">
                <strong>Total Votes:</strong> {totalVotes}
              </div>
              
              <ListGroup className="mb-3">
                {vote.votes.map((count, index) => {
                  // Get the option text from IPFS data if available
                  const optionLabel = vote.ipfsData && vote.ipfsData.options && vote.ipfsData.options[index]
                    ? vote.ipfsData.options[index]
                    : `Option ${index + 1}`;
                  
                  // Calculate percentage for progress bar
                  const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                  
                  // Determine progress bar variant based on vote count ranking
                  let variant = "info";
                  if (Math.max(...vote.votes) === count && count > 0) {
                    variant = "success"; // Leading option
                  } else if (count === 0) {
                    variant = "secondary"; // No votes
                  }
                    
                  return (
                    <ListGroup.Item key={index}>
                      <div className="mb-1 d-flex justify-content-between">
                        <span className="fw-bold">{optionLabel}</span>
                        <span>{count} votes ({percentage}%)</span>
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
                                  <span className="visually-hidden">Voting...</span>
                                </>
                              ) : (
                                "Vote"
                              )}
                            </Button>
                          )}
                          {vote.hasVoted && (
                            <span className="badge bg-secondary">You voted</span>
                          )}
                        </div>
                      </div>
                    </ListGroup.Item>
                  );
                })}
              </ListGroup>
            </Card.Body>
          </Card>
        );
      })}
    </div>
  );
};

export default Votes;