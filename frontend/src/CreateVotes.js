import { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AppContext } from "./App";
import { 
  Form, Button, Alert, Spinner, Card, Badge, OverlayTrigger, Tooltip, Row, Col
} from "react-bootstrap";

const CreateVotes = () => {
  const { contract, connected, isMember } = useContext(AppContext);
  const [uri, setUri] = useState("");
  const [options, setOptions] = useState(2);
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check for IPFS URI passed from the generator
  useEffect(() => {
    if (location.state?.ipfsUri) {
      setUri(location.state.ipfsUri);
    }
  }, [location.state]);

  const createVote = async () => {
    if (!uri.trim()) {
      setError("Please enter an IPFS URI");
      return;
    }

    if (!endDate) {
      setError("Please select an end date");
      return;
    }

    const endTimestamp = new Date(endDate).getTime();
    if (endTimestamp <= Date.now()) {
      setError("End date must be in the future");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const tx = await contract.createVote(uri, Math.floor(endTimestamp / 1000), parseInt(options));
      await tx.wait(); 
      
      setSuccess(true);
      
      // Reset form fields
      setUri("");
      setOptions(2);
      setEndDate("");
    } catch (err) {
      console.error("Error creating vote:", err);
      setError(`Error creating vote: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const navigateToGenerator = () => {
    navigate("/generate-ipfs");
  };

  const renderTooltip = (id) => (props) => (
    <Tooltip id={id} {...props}>
      {id === 'options' ? 'This should match the number of options in your IPFS metadata' : 'Copy to clipboard'}
    </Tooltip>
  );

  // Display appropriate messages if not connected or not a member
  if (!connected) {
    return (
      <div className="text-center my-5">
        <Alert variant="warning">
          <i className="bi bi-exclamation-circle me-2"></i>
          Please connect to MetaMask to create a vote
        </Alert>
      </div>
    );
  }

  if (!isMember) {
    return (
      <div className="text-center my-5">
        <Alert variant="warning">
          <i className="bi bi-shield-lock me-2"></i>
          You need to become a member to create a vote
        </Alert>
      </div>
    );
  }

  return (
    <div className="my-4">
      <h2 className="text-center mb-4">
        <i className="bi bi-check-square me-2"></i>
        Create a Vote
      </h2>
      
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      )}
      
      {success ? (
        <Card className="shadow-sm mb-4 ">
          <Card.Header className=" text-white">
            <i className="bi bi-check-circle me-2"></i>
            Vote Created Successfully!
          </Card.Header>
          <Card.Body>
            <p className="mb-4 text-white-50">Your vote has been successfully created and recorded on the blockchain.</p>
            
            <div className="d-flex mt-4 gap-2">
              <Button 
                onClick={() => setSuccess(false)}
                className="flex-grow-1"
              >
                <i className="bi bi-plus-circle me-2"></i>
                Create Another Vote
              </Button>
              
              <Button 
                 
                onClick={() => navigate("/votes")}
                className="flex-grow-1"
              >
                <i className="bi bi-list-check me-2"></i>
                View All Votes
              </Button>
            </div>
          </Card.Body>
        </Card>
      ) : (
        <Card className="shadow-sm">
          <Card.Body>
            <Form.Group className="mb-4">
              <Form.Label><strong>IPFS URI</strong></Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your vote IPFS URI (e.g., ipfs/QmYourHash...)"
                value={uri}
                onChange={(e) => setUri(e.target.value)}
              />
              <Form.Text className="text-muted d-flex align-items-center">
                <i className="bi bi-info-circle me-1"></i>
                Don't have an IPFS URI?
                <Button 
                  variant="link" 
                  className="p-0 ms-1" 
                  onClick={navigateToGenerator}
                >
                  Use our IPFS generator
                </Button>
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-4">
              <Form.Label><strong>Number of Options</strong></Form.Label>
              <div className="d-flex align-items-center">
                <Form.Control
                  type="number"
                  min={2}
                  max={10}
                  value={options}
                  onChange={(e) => setOptions(parseInt(e.target.value))}
                  className="me-2"
                />
                <OverlayTrigger
                  placement="right"
                  delay={{ show: 250, hide: 400 }}
                  overlay={renderTooltip('options')}
                >
                  <i className="bi bi-question-circle"></i>
                </OverlayTrigger>
              </div>
              <Form.Text className="text-muted">
                This should match the number of options in your IPFS metadata.
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-4">
              <Form.Label><strong>End Date</strong></Form.Label>
              <Form.Control
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
              <Form.Text className="text-muted">
                The date when voting will end and results will be finalized.
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label><strong>Vote Status</strong></Form.Label>
              <Badge bg="info" className="text-dark">
                <i className="bi bi-info-circle me-1"></i>
                Active
              </Badge>
          </Form.Group>
            
            <Button
              variant="primary"
              onClick={createVote}
              disabled={loading}
              className="w-100"
            >
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Creating vote on blockchain...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle me-2"></i>
                  Create Vote
                </>
              )}
            </Button>
          </Card.Body>
        </Card>
      )}
      
      {!success && (
        <div className="mt-4">
          <h4>
            <i className="bi bi-eye me-2"></i>
            Preview
          </h4>
          <Card className="text-white shadow-sm">
            <Card.Body>
              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <h6><i className="bi bi-link-45deg me-1"></i> IPFS URI</h6>
                    <p className="font-monospace text-truncate">
                      {uri || "ipfs/QmExample..."}
                    </p>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="mb-3">
                    <h6><i className="bi bi-list-ul me-1"></i> Options</h6>
                    <p>
                      {options} voting options
                    </p>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="mb-3">
                    <h6><i className="bi bi-calendar-event me-1"></i> End Date</h6>
                    <p>
                      {endDate 
                        ? new Date(endDate).toLocaleDateString() 
                        : "Not set"}
                    </p>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CreateVotes;