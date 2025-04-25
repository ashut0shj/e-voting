import { useState, useContext } from 'react';
import { Form, Button, Alert, Spinner, Card, Row, Col, InputGroup, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { AppContext } from './App';

const IPFSGenerator = () => {
  const { connected, isMember } = useContext(AppContext);
  const navigate = useNavigate();
  
  const [description, setDescription] = useState('');
  const [optionsCount, setOptionsCount] = useState(2);
  const [options, setOptions] = useState(['', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [ipfsHash, setIpfsHash] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [copySuccess, setCopySuccess] = useState('');
  
  // Handle changing the number of options
  const handleOptionsCountChange = (count) => {
    const newCount = parseInt(count);
    if (newCount < 2) return;
    
    setOptionsCount(newCount);
    
    // Adjust the options array size
    if (newCount > options.length) {
      // Add empty options
      setOptions([...options, ...Array(newCount - options.length).fill('')]);
    } else {
      // Remove extra options
      setOptions(options.slice(0, newCount));
    }
  };
  
  // Handle option text change
  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };
  
  // Copy text to clipboard with visual feedback
  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopySuccess(type);
        setTimeout(() => setCopySuccess(''), 2000);
      })
      .catch(err => {
        setError('Failed to copy to clipboard');
      });
  };
  
  // Generate IPFS metadata JSON and upload to Pinata
  const generateIPFS = async () => {
    if (!description.trim()) {
      setError('Please enter a description for the vote');
      return;
    }
    
    if (!apiKey || !apiSecret) {
      setError('Please enter your Pinata API credentials');
      return;
    }
    
    // Validate all options have content
    const emptyOptionIndex = options.findIndex(opt => !opt.trim());
    if (emptyOptionIndex !== -1) {
      setError(`Option ${emptyOptionIndex + 1} cannot be empty`);
      return;
    }
    
    // Create metadata object
    const metadata = {
      description: description.trim(),
      options: options.map(opt => opt.trim()),
      createdAt: new Date().toISOString()
    };
    
    setLoading(true);
    setError(null);
    
    try {
      // Upload to Pinata Cloud
      const pinataEndpoint = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
      
      const response = await fetch(pinataEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': apiKey,
          'pinata_secret_api_key': apiSecret
        },
        body: JSON.stringify({
          pinataContent: metadata,
          pinataMetadata: {
            name: `Vote-${description.substring(0, 30)}`
          }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload to IPFS');
      }
      
      const result = await response.json();
      setIpfsHash(result.IpfsHash);
      setSuccess(true);
      
      // Reset form fields except API credentials
      setDescription('');
      setOptions(Array(optionsCount).fill(''));
      
    } catch (err) {
      setError(`Failed to upload to IPFS: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const goToCreateVote = () => {
    navigate('/create-vote', { state: { ipfsUri: `ipfs/${ipfsHash}` } });
  };
  
  const renderTooltip = (id) => (props) => (
    <Tooltip id={id} {...props}>
      {copySuccess === id ? 'Copied!' : 'Copy to clipboard'}
    </Tooltip>
  );
  
  if (!connected) {
    return (
      <div className="text-center my-5">
        <Alert variant="warning">
          <i className="bi bi-exclamation-circle me-2"></i>
          Please connect to MetaMask to generate IPFS metadata
        </Alert>
      </div>
    );
  }

  if (!isMember) {
    return (
      <div className="text-center my-5">
        <Alert variant="warning">
          <i className="bi bi-shield-lock me-2"></i>
          You need to become a member to generate vote metadata
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="my-4">
      <h2 className="text-center mb-4">Create Vote Metadata</h2>
      
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      )}
      
      {success ? (
        <Card className="shadow-sm mb-4">
          <Card.Header className="bg-success text-white">
            <i className="bi bi-check-circle me-2"></i>
            Successfully uploaded to IPFS!
          </Card.Header>
          <Card.Body>
            <div className="mb-3">
              <h5>IPFS Hash:</h5>
              <InputGroup>
                <Form.Control
                  type="text"
                  value={ipfsHash}
                  readOnly
                />
                <OverlayTrigger
                  placement="top"
                  delay={{ show: 250, hide: 400 }}
                  overlay={renderTooltip('hash')}
                >
                  <Button 
                    variant="outline-primary"
                    onClick={() => copyToClipboard(ipfsHash, 'hash')}
                  >
                    {copySuccess === 'hash' ? (
                      <i className="bi bi-check"></i>
                    ) : (
                      <i className="bi bi-clipboard"></i>
                    )}
                  </Button>
                </OverlayTrigger>
              </InputGroup>
              <Form.Text className="text-muted">
                Use this IPFS hash as the URI when creating your vote.
              </Form.Text>
            </div>
            
            <div className="mb-3">
              <h5>IPFS URI Format:</h5>
              <InputGroup>
                <Form.Control
                  type="text"
                  value={`ipfs/${ipfsHash}`}
                  readOnly
                />
                <OverlayTrigger
                  placement="top"
                  delay={{ show: 250, hide: 400 }}
                  overlay={renderTooltip('uri')}
                >
                  <Button 
                    variant="outline-primary"
                    onClick={() => copyToClipboard(`ipfs/${ipfsHash}`, 'uri')}
                  >
                    {copySuccess === 'uri' ? (
                      <i className="bi bi-check"></i>
                    ) : (
                      <i className="bi bi-clipboard"></i>
                    )}
                  </Button>
                </OverlayTrigger>
              </InputGroup>
              <Form.Text className="text-muted">
                This is the formatted URI you can directly use in the create vote form.
              </Form.Text>
            </div>
            
            <div className="d-flex mt-4 gap-2">
              <Button 
                variant="outline-secondary" 
                onClick={() => {
                  setSuccess(false);
                  setIpfsHash('');
                }}
                className="flex-grow-1"
              >
                <i className="bi bi-plus-circle me-2"></i>
                Create Another
              </Button>
              
              <Button 
                variant="success" 
                onClick={goToCreateVote}
                className="flex-grow-1"
              >
                <i className="bi bi-arrow-right-circle me-2"></i>
                Continue to Create Vote
              </Button>
            </div>
          </Card.Body>
        </Card>
      ) : (
        <Card className="shadow-sm">
          <Card.Body>
            <Form.Group className="mb-3">
              <Form.Label>Vote Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter a detailed description of what this vote is about"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <Form.Text className="text-muted">
                Provide a clear description to help voters understand the purpose of this vote.
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Number of Options</Form.Label>
              <Form.Control
                type="number"
                min={2}
                max={10}
                value={optionsCount}
                onChange={(e) => handleOptionsCountChange(e.target.value)}
              />
              <Form.Text className="text-muted">
                You can have between 2 and 10 voting options.
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-4">
              <Form.Label>Vote Options</Form.Label>
              {options.map((option, index) => (
                <Form.Control
                  key={index}
                  className="mb-2"
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                />
              ))}
            </Form.Group>
            
            <Card className="bg-light mb-4">
              <Card.Body>
                <Card.Title>Pinata API Credentials</Card.Title>
                <Card.Text className="text-muted mb-3">
                  Enter your Pinata API credentials to upload metadata to IPFS:
                </Card.Text>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>API Key</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter your Pinata API Key"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>API Secret</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Enter your Pinata API Secret"
                        value={apiSecret}
                        onChange={(e) => setApiSecret(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
            
            <Button
              variant="primary"
              onClick={generateIPFS}
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
                  Uploading to IPFS...
                </>
              ) : (
                <>
                  <i className="bi bi-cloud-upload me-2"></i>
                  Generate IPFS Metadata
                </>
              )}
            </Button>
          </Card.Body>
        </Card>
      )}
      
      <div className="mt-4">
        <h4>
          <i className="bi bi-eye me-2"></i>
          Preview
        </h4>
        <Card className="bg-light">
          <Card.Body>
            <pre className="mb-0 code-preview">
              {JSON.stringify(
                {
                  description: description || "Your vote description",
                  options: options.every(opt => opt === '') 
                    ? ["Option 1", "Option 2"] 
                    : options.filter(opt => opt !== ''),
                  createdAt: new Date().toISOString()
                }, 
                null, 2
              )}
            </pre>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default IPFSGenerator;