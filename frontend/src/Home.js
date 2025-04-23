import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "./App";
import { Card, Row, Col, Button, Alert, Spinner } from "react-bootstrap";

function Home() {
  const { contract, connected, isMember, connectWallet, becomeMember, loading } = useContext(AppContext);
  const [stats, setStats] = useState({
    totalVotes: 0,
    activeVotes: 0,
    totalMembers: 0
  });
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    if (contract) {
      fetchStats();
    }
  }, [contract]);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const totalVotes = await contract.getVotesCount();
      const activeVotes = await contract.getActiveVotesCount();
      const totalMembers = await contract.getMembersCount();
      
      setStats({
        totalVotes: totalVotes.toNumber(),
        activeVotes: activeVotes.toNumber(),
        totalMembers: totalMembers.toNumber()
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  return (
    <div className="py-5">
      <div className="text-center mb-5">
        <h1 className="display-4 mb-3">Welcome to DecentralVote</h1>
        <p className="lead">A blockchain-powered voting platform for transparent and secure decision making</p>
        
        {!connected && (
          <Button 
            variant="primary" 
            size="lg" 
            onClick={connectWallet} 
            disabled={loading}
            className="mt-3"
          >
            {loading ? (
              <>
                <Spinner as="span" animation="border" size="sm" className="me-2" />
                Connecting...
              </>
            ) : (
              "Connect Wallet"
            )}
          </Button>
        )}
        
        {connected && !isMember && (
          <div className="mt-4">
            <Alert variant="info">
              You need to be a member to create and participate in votes
            </Alert>
            <Button 
              variant="success" 
              size="lg" 
              onClick={becomeMember}
            >
              Become a Member
            </Button>
          </div>
        )}
      </div>

      {connected && (
        <Row className="mb-5">
          <Col md={4} className="mb-4">
            <Card className="h-100 shadow-sm">
              <Card.Body className="text-center">
                <div className="display-3 mb-3">{loadingStats ? <Spinner animation="border" /> : stats.totalVotes}</div>
                <Card.Title>Total Votes</Card.Title>
                <Card.Text>All votes created on the platform</Card.Text>
                <Link to="/votes">
                  <Button variant="outline-primary">View All Votes</Button>
                </Link>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="h-100 shadow-sm">
              <Card.Body className="text-center">
                <div className="display-3 mb-3">{loadingStats ? <Spinner animation="border" /> : stats.activeVotes}</div>
                <Card.Title>Active Votes</Card.Title>
                <Card.Text>Ongoing votes that need your participation</Card.Text>
                <Link to="/votes">
                  <Button variant="outline-success">Participate Now</Button>
                </Link>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="h-100 shadow-sm">
              <Card.Body className="text-center">
                <div className="display-3 mb-3">{loadingStats ? <Spinner animation="border" /> : stats.totalMembers}</div>
                <Card.Title>Community Members</Card.Title>
                <Card.Text>Members who can participate in voting</Card.Text>
                <Link to="/dashboard">
                  <Button variant="outline-info">View Dashboard</Button>
                </Link>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {connected && isMember && (
        <Row className="gx-4 gy-4">
          <Col md={6}>
            <Card className="shadow-sm">
              <Card.Body>
                <Card.Title>Create a New Vote</Card.Title>
                <Card.Text>
                  Start a new proposal and let the community decide. You can create votes on any topic.
                </Card.Text>
                <Link to="/create-vote">
                  <Button variant="primary">Create Vote</Button>
                </Link>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="shadow-sm">
              <Card.Body>
                <Card.Title>Your Dashboard</Card.Title>
                <Card.Text>
                  View your voting activity, created proposals, and membership status.
                </Card.Text>
                <Link to="/dashboard">
                  <Button variant="info">Go to Dashboard</Button>
                </Link>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
}

export default Home;