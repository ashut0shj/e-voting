import { useState, useEffect, useContext } from "react";
import { Card, Alert, Spinner, ListGroup, Badge, Tabs, Tab } from "react-bootstrap";
import { AppContext } from "./App";
import { Link } from "react-router-dom";

const UserDashboard = () => {
  const { contract, connected, isMember, signer } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createdVotes, setCreatedVotes] = useState([]);
  const [participatedVotes, setParticipatedVotes] = useState([]);
  const [address, setAddress] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!contract || !signer) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const userAddress = await signer.getAddress();
        setAddress(userAddress);
        
        // Fetch all votes
        const allVotes = [];
        const maxVoteId = 100; // Adjust based on your expected number of votes
        
        for (let i = 0; i < maxVoteId; i++) {
          try {
            const voteData = await contract.getVote(i);
            
            if (voteData && voteData[0] && voteData[0] !== "") {
              // Check if user has voted on this vote
              const hasVoted = await contract.didVote(userAddress, i);
              
              const endTimeMs = Number(voteData[3]) * 1000;
              const active = endTimeMs > Date.now();
              
              allVotes.push({
                id: i,
                uri: voteData[0],
                owner: voteData[1],
                votes: voteData[2].map(v => Number(v)),
                endTime: endTimeMs,
                hasVoted: hasVoted,
                isOwner: voteData[1].toLowerCase() === userAddress.toLowerCase(),
                active: active
              });
            }
          } catch (err) {
            // Skip non-existent votes
            console.log(`Vote ${i} doesn't exist or can't be fetched`);
          }
        }
        
        // Filter for created and participated votes
        const created = allVotes.filter(vote => vote.isOwner);
        const participated = allVotes.filter(vote => vote.hasVoted && !vote.isOwner);
        
        setCreatedVotes(created);
        setParticipatedVotes(participated);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user data: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (connected && contract && signer) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [contract, connected, signer]);

  const calculateTotalVotes = (voteArray) => {
    return voteArray.reduce((total, count) => total + count, 0);
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const shortenAddress = (address) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };



  if (!isMember) {
    return (
      <div className="text-center my-5">
        <Alert variant="warning">
          You need to become a member to have a dashboard
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
        <p className="mt-2">Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-3">
        <Alert variant="danger">{error}</Alert>
      </div>
    );
  }

  return (
    <div className="my-4">
      <h2 className="mb-4 text-center">Your Dashboard</h2>
      
      {address && (
        <Card className="mb-4">
          <Card.Body>
            <Card.Title>Account Summary</Card.Title>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <strong>Address:</strong> {address}
                <span className="ms-2 badge bg-success">Member</span>
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Votes Created:</strong> {createdVotes.length}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Votes Participated In:</strong> {participatedVotes.length}
              </ListGroup.Item>
            </ListGroup>
          </Card.Body>
        </Card>
      )}
      
      <Tabs defaultActiveKey="created" className="mb-3">
        <Tab eventKey="created" title={`Created Votes (${createdVotes.length})`}>
          {createdVotes.length === 0 ? (
            <Alert variant="info">You haven't created any votes yet.</Alert>
          ) : (
            createdVotes.map(vote => (
              <Card key={vote.id} className="mb-3">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <div>Vote #{vote.id}</div>
                  <Badge bg={vote.active ? "success" : "danger"}>
                    {vote.active ? "Active" : "Ended"}
                  </Badge>
                </Card.Header>
                <Card.Body>
                  <Card.Title>{vote.uri}</Card.Title>
                  <Card.Text>
                    <small>End Date: {formatDate(vote.endTime)}</small><br/>
                    <small>Total Votes: {calculateTotalVotes(vote.votes)}</small>
                  </Card.Text>
                  <Link to="/votes" className="btn btn-primary btn-sm">View Details</Link>
                </Card.Body>
              </Card>
            ))
          )}
        </Tab>
        
        <Tab eventKey="participated" title={`Participated Votes (${participatedVotes.length})`}>
          {participatedVotes.length === 0 ? (
            <Alert variant="info">You haven't voted on any proposals yet.</Alert>
          ) : (
            participatedVotes.map(vote => (
              <Card key={vote.id} className="mb-3">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <div>Vote #{vote.id}</div>
                  <Badge bg={vote.active ? "success" : "danger"}>
                    {vote.active ? "Active" : "Ended"}
                  </Badge>
                </Card.Header>
                <Card.Body>
                  <Card.Title>{vote.uri}</Card.Title>
                  <Card.Text>
                    <small>Created by: {shortenAddress(vote.owner)}</small><br/>
                    <small>End Date: {formatDate(vote.endTime)}</small><br/>
                    <small>Total Votes: {calculateTotalVotes(vote.votes)}</small>
                  </Card.Text>
                  <Link to="/votes" className="btn btn-primary btn-sm">View Details</Link>
                </Card.Body>
              </Card>
            ))
          )}
        </Tab>
      </Tabs>
    </div>
  );
};

export default UserDashboard;