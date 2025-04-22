import { useState, useEffect, useContext } from "react";
import { Button, Card, ListGroup, Alert, Spinner } from "react-bootstrap";
import { AppContext } from "./App";

const Votes = () => {
  const { contract, connected, isMember, signer } = useContext(AppContext);
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [votingInProgress, setVotingInProgress] = useState({});

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
              
              votesData.push({
                id: i,
                uri: voteData[0],
                owner: voteData[1],
                votes: voteData[2].map(v => Number(v)),
                endTime: Number(voteData[3]) * 1000, // Convert to milliseconds
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
        
        return (
          <Card key={vote.id} className="mb-4">
            <Card.Header>
              <h5>Vote #{vote.id}</h5>
              <small>Created by: {vote.owner}</small>
            </Card.Header>
            <Card.Body>
              <Card.Title>
                {vote.ipfsData && vote.ipfsData.description 
                  ? vote.ipfsData.description 
                  : `Topic: ${vote.uri}`}
              </Card.Title>
              <Card.Text>
                <strong>Status: </strong> 
                {votingEnded ? 
                  <span className="text-danger">Voting Ended</span> : 
                  <span className="text-success">Voting Active</span>
                }
              </Card.Text>
              <Card.Text>
                <strong>Ends at:</strong> {new Date(vote.endTime).toLocaleString()}
              </Card.Text>
              <ListGroup className="mb-3">
                {vote.votes.map((count, index) => {
                  // Get the option text from IPFS data if available
                  const optionLabel = vote.ipfsData && vote.ipfsData.options && vote.ipfsData.options[index]
                    ? vote.ipfsData.options[index]
                    : `Option ${index + 1}`;
                    
                  return (
                    <ListGroup.Item 
                      key={index}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <span>{optionLabel}</span>
                      <div>
                        <span className="badge bg-primary me-2">{count} votes</span>
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