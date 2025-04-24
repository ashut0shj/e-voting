import { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AppContext } from "./App";
import { 
  Container, Row, Col, Button, Form, Alert, Spinner, Card, Badge, Tooltip, OverlayTrigger
} from "react-bootstrap";
import { 
  FileEarmarkTextFill, CalendarEventFill, ListUl, 
  QuestionCircleFill, ArrowRightCircle, CloudUploadFill,
  ExclamationTriangleFill, LightningFill
} from "react-bootstrap-icons";

const CreateVotes = () => {
  const { contract, connected, isMember } = useContext(AppContext);
  const [uri, setUri] = useState("");
  const [options, setOptions] = useState(2);
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [animateElements, setAnimateElements] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();
  const location = useLocation();

  // Animation effect on component mount
  useEffect(() => {
    setTimeout(() => {
      setAnimateElements(true);
    }, 100);
    
    // Check for IPFS URI passed from the generator
    if (location.state?.ipfsUri) {
      setUri(location.state.ipfsUri);
    }
  }, [location.state]);

  const createVote = async () => {
    if (!contract) {
      alert("Please connect to Metamask first");
      return;
    }

    if (!isMember) {
      alert("You need to become a member first");
      return;
    }

    if (!uri.trim()) {
      alert("Please enter an IPFS URI");
      return;
    }

    if (!endDate) {
      alert("Please select an end date");
      return;
    }

    const endTimestamp = new Date(endDate).getTime();
    if (endTimestamp <= Date.now()) {
      alert("End date must be in the future");
      return;
    }

    setLoading(true);
    
    try {
      const tx = await contract.createVote(uri, Math.floor(endTimestamp / 1000), parseInt(options));
      await tx.wait(); 
      
      setUri("");
      setOptions(2);
      setEndDate("");
      setTitle("");
      setDescription("");
      
      // Success animation before navigating
      setTimeout(() => {
        navigate("/votes");
      }, 1500);
    } catch (e) {
      console.error("Error creating vote:", e);
      alert("Error creating vote: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const navigateToGenerator = () => {
    navigate("/generate-ipfs");
  };

  const renderTooltip = (content) => (
    <Tooltip className="tooltip-custom">
      {content}
    </Tooltip>
  );

  // Display appropriate messages if not connected or not a member
  if (!connected) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <div className={`animate-in ${animateElements ? 'show' : ''}`}>
              <Alert variant="warning" className="d-flex align-items-center shadow-sm border-left-warning">
                <ExclamationTriangleFill size={24} className="me-3" />
                <div>
                  <h5 className="mb-1">Wallet Not Connected</h5>
                  <p className="mb-0">Please connect your wallet to create a new vote proposal.</p>
                </div>
              </Alert>
              <div className="text-center mt-4">
                <Button variant="primary" size="lg" onClick={() => navigate("/")}>
                  Return to Home
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    );
  }

  if (!isMember) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <div className={`animate-in ${animateElements ? 'show' : ''}`}>
              <Alert variant="info" className="d-flex align-items-center shadow-sm">
                <ExclamationTriangleFill size={24} className="me-3" />
                <div>
                  <h5 className="mb-1">Membership Required</h5>
                  <p className="mb-0">You need to become a member to create vote proposals.</p>
                </div>
              </Alert>
              <div className="text-center mt-4">
                <Button variant="primary" size="lg" onClick={() => navigate("/")}>
                  Return to Home
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <>
      {/* Custom CSS for enhanced styling */}
      <style>
        {`
          .step-indicator {
            position: relative;
            display: flex;
            justify-content: space-between;
            margin-bottom: 2rem;
          }
          
          .step {
            position: relative;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: var(--dark-medium);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            z-index: 2;
            transition: all 0.3s ease;
            border: 2px solid transparent;
          }
          
          .step.active {
            background: var(--primary);
            color: white;
            box-shadow: 0 0 15px rgba(155, 85, 255, 0.5);
          }
          
          .step.completed {
            background: var(--success);
            color: white;
          }
          
          .step-line {
            position: absolute;
            top: 50%;
            left: 0;
            right: 0;
            height: 3px;
            background: var(--dark-medium);
            transform: translateY(-50%);
            z-index: 1;
          }
          
          .step-progress {
            position: absolute;
            top: 50%;
            left: 0;
            height: 3px;
            background: linear-gradient(90deg, var(--primary), var(--success));
            transform: translateY(-50%);
            z-index: 1;
            transition: width 0.5s ease;
          }
          
          .step-content {
            transition: all 0.5s ease;
          }
          
          .form-floating-label {
            position: absolute;
            top: -10px;
            left: 10px;
            padding: 0 5px;
            font-size: 12px;
            background-color: var(--dark-light);
          }
          
          .create-vote-card {
            background: linear-gradient(145deg, var(--dark-light), var(--dark-medium));
            border: 1px solid rgba(155, 85, 255, 0.2);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          }
          
          .create-vote-header {
            background: rgba(155, 85, 255, 0.1);
            border-bottom: 1px solid rgba(155, 85, 255, 0.2);
          }
          
          .vote-success {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0, 0, 0, 0.8);
            z-index: 1050;
            animation: fadeIn 0.3s ease forwards;
          }
          
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          .vote-success-inner {
            background: var(--dark-light);
            border-radius: var(--card-border-radius);
            padding: 2rem;
            text-align: center;
            box-shadow: 0 0 30px rgba(155, 85, 255, 0.3);
            animation: scaleIn 0.5s ease forwards;
          }
          
          @keyframes scaleIn {
            from { transform: scale(0.8); }
            to { transform: scale(1); }
          }
          
          .success-icon {
            font-size: 4rem;
            color: var(--success);
            animation: pulse 2s infinite;
          }
          
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
        `}
      </style>

      <Container className="py-5">
        <Row className="justify-content-center">
          <Col lg={10}>
            <div className={`animate-in ${animateElements ? 'show' : ''}`}>
              <Card className="create-vote-card shadow">
                <Card.Header className="create-vote-header p-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h3 className="mb-1 text-white">Create a New Vote Proposal</h3>
                      <p className="text-white mb-0">
                        Launch a transparent and immutable voting proposal on the blockchain
                      </p>
                    </div>
                    <Badge bg="primary" className="px-3 py-2">
                      <LightningFill className="me-1" /> On-Chain
                    </Badge>
                  </div>
                </Card.Header>

                <Card.Body className="p-4">
                  {/* Success message when vote is created */}
                  {loading && (
                    <div className="vote-success">
                      <div className="vote-success-inner">
                        <div className="success-icon mb-4">
                          <LightningFill />
                        </div>
                        <h3 className="mb-3">Creating Your Vote</h3>
                        <p className="mb-4">Your vote is being recorded on the blockchain...</p>
                        <Spinner animation="border" variant="primary" />
                      </div>
                    </div>
                  )}

                

                  {currentStep === 1 && (
                    <div className="step-content">
                      <Alert variant="info" className="mb-4">
                        <div className="d-flex">
                          <div className="me-3">
                            <CloudUploadFill size={24} />
                          </div>
                          <div>
                            <h5 className="alert-heading">IPFS Storage</h5>
                            <p className="mb-0">
                              We'll store your vote data on IPFS to ensure it's decentralized and permanent.
                              <Button 
                                variant="link" 
                                className="p-0 ms-2" 
                                onClick={navigateToGenerator}
                              >
                                Use our IPFS generator
                              </Button>
                            </p>
                          </div>
                        </div>
                      </Alert>
                      
                      <Form.Group className="mb-4 position-relative">
                        <Form.Label>
                          <FileEarmarkTextFill className="me-2" />
                          IPFS URI
                        </Form.Label>
                        <Form.Control 
                          type="text" 
                          value={uri}
                          placeholder="IPFS URI (e.g., ipfs/QmYourHash...)"
                          onChange={(e) => setUri(e.target.value)}
                          className="py-3"
                        />
                        <Form.Text className="text-gray-light">
                          Enter the IPFS URI from our generator or your own IPFS hash in the format "ipfs/QmYourHash..."
                        </Form.Text>
                      </Form.Group>
                      
                      <Form.Group className="mb-4">
                        <Form.Label>
                          <ListUl className="me-2" />
                          Number of Options
                        </Form.Label>
                        <OverlayTrigger
                          placement="right"
                          overlay={renderTooltip("This should match the number of options in your IPFS metadata")}
                        >
                          <div className="d-flex align-items-center">
                            <Form.Control 
                              type="number"
                              min={2}
                              max={8}
                              value={options}
                              onChange={(e) => setOptions(parseInt(e.target.value))}
                              className="me-3"
                            />
                            <div className="gradient-text fs-3 fw-bold">{options}</div>
                            <QuestionCircleFill size={14} className="ms-2 text-white" />
                          </div>
                        </OverlayTrigger>
                        <div className="mt-2 d-flex justify-content-between px-2">
                          <small className="text-white">Min: 2</small>
                          <small className="text-white">Max: 8</small>
                        </div>
                      </Form.Group>
                      
                      <div className="step-content">
                      <Row>
                        <Col lg={6}>
                          <Form.Group className="mb-4">
                            <Form.Label>
                              <CalendarEventFill className="me-2" />
                              End Date
                            </Form.Label>
                            <Form.Control 
                              type="date" 
                              value={endDate}
                              onChange={(e) => setEndDate(e.target.value)}
                              className="py-3"
                              min={new Date().toISOString().split('T')[0]}
                            />
                            <Form.Text className="text-gray-light">
                              The date when voting will end and results will be finalized
                            </Form.Text>
                          </Form.Group>
                        </Col>
                      </Row>
                    </div>



                      <div className="d-flex justify-content-between mt-4">
                        
                        <Button 
                          variant="success" 
                          size="lg"
                          onClick={createVote}
                          disabled={loading}
                          className="vote-button px-5"
                        >
                          {loading ? (
                            <>
                              <Spinner as="span" animation="border" size="sm" className="me-2" />
                              Creating Vote...
                            </>
                          ) : (
                            <>Create Vote</>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="step-content">
                      <Row>
                        <Col lg={6}>
                          <Form.Group className="mb-4">
                            <Form.Label>
                              <CalendarEventFill className="me-2" />
                              End Date
                            </Form.Label>
                            <Form.Control 
                              type="date" 
                              value={endDate}
                              onChange={(e) => setEndDate(e.target.value)}
                              className="py-3"
                              min={new Date().toISOString().split('T')[0]}
                            />
                            <Form.Text className="text-gray-light">
                              The date when voting will end and results will be finalized
                            </Form.Text>
                          </Form.Group>
                        </Col>
                      </Row>
                      
                      <div className="bg-dark-medium p-4 rounded mb-4">
                        <h5 className="mb-3">
                          <Badge bg="warning" className="me-2">Important</Badge>
                          About On-Chain Voting
                        </h5>
                        <p className="mb-0">
                          All vote data will be permanently stored on the Ethereum blockchain. This ensures 
                          transparency and immutability, but also means you cannot modify or delete the vote 
                          after creation. Please verify all details carefully before submission.
                        </p>
                      </div>

                      
                      <div className="d-flex justify-content-between mt-5">
                        <Button 
                          variant="outline-primary" 
                          onClick={() => setCurrentStep(1)}
                        >
                          Back
                        </Button>
                        <Button 
                          variant="primary" 
                          onClick={() => setCurrentStep(3)}
                          disabled={!endDate}
                        >
                          Next <ArrowRightCircle className="ms-1" />
                        </Button>
                      </div>

                          <div className="border border-primary-light rounded p-3 h-100">
                            <div className="d-flex align-items-center mb-3">
                              <CalendarEventFill className="text-primary me-2" />
                              <h6 className="mb-0">End Date</h6>
                            </div>
                            <p className="mb-0 text-white">
                              {new Date(endDate).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="step-content">
                      <h5 className="mb-4">Review and Confirm</h5>
                      
                      <Row className="gy-4">
                        <Col md={6}>
                          <div className="border border-primary-light rounded p-3 h-100">
                            <div className="d-flex align-items-center mb-3">
                              <FileEarmarkTextFill className="text-primary me-2" />
                              <h6 className="mb-0">IPFS URI</h6>
                            </div>
                            <p className="mb-0 text-white word-break-all">
                              {uri}
                            </p>
                          </div>
                        </Col>
                        
                        <Col md={6}>
                          <div className="border border-primary-light rounded p-3 h-100">
                            <div className="d-flex align-items-center mb-3">
                              <ListUl className="text-primary me-2" />
                              <h6 className="mb-0">Number of Options</h6>
                            </div>
                            <p className="mb-0 text-white">
                              {options} voting options
                            </p>
                          </div>
                        </Col>
                        
                        <Col md={6}>
                          <div className="border border-primary-light rounded p-3 h-100">
                            <div className="d-flex align-items-center mb-3">
                              <CalendarEventFill className="text-primary me-2" />
                              <h6 className="mb-0">End Date</h6>
                            </div>
                            <p className="mb-0 text-white">
                              {new Date(endDate).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </Col>
                      </Row>
                      
                      <div className="mt-5">
                        <Alert variant="info">
                          <div className="d-flex">
                            <div className="me-3">
                              <ExclamationTriangleFill size={20} />
                            </div>
                            <div>
                              <p className="mb-0">
                                Creating a vote requires a blockchain transaction. Please confirm your details 
                                before proceeding. Your wallet will ask you to approve the transaction.
                              </p>
                            </div>
                          </div>
                        </Alert>
                      </div>
                      
                      
                    </div>
                  )}
                </Card.Body>
              </Card>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default CreateVotes;