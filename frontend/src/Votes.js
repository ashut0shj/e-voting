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
    const now = Date.now();
    
    const maxReasonableTime = now + (10 * 365 * 24 * 60 * 60 * 1000); 
    
    if (endTime > maxReasonableTime || endTime <= now) {
      return { text: endTime <= now ? "Voting ended" : "Time calculation error" };
    }
    
    const totalMs = endTime - now;
    const days = Math.floor(totalMs / (1000 * 60 * 60 * 24));
    
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
    
    const intervalId = setInterval(updateAllTimeRemaining, 60000); 
    
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
              
              let endTimeMs;
              
              if (endTimeSeconds > 253402300800) { 
                console.warn(`End time for vote ${i} seems invalid: ${endTimeSeconds}`);
                endTimeMs = Date.now() + (7 * 24 * 60 * 60 * 1000); 
              } else {
                endTimeMs = endTimeSeconds * 1000;
              }
              
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
                  const optionLabel = vote.ipfsData && vote.ipfsData.options && vote.ipfsData.options[index]
                    ? vote.ipfsData.options[index]
                    : `Option ${index + 1}`;
                  
                  const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                  
                  let variant = "info";
                  if (Math.max(...vote.votes) === count && count > 0) {
                    variant = "success"; 
                  } else if (count === 0) {
                    variant = "secondary"; 
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