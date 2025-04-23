import { Button, Form, Alert, Spinner } from "react-bootstrap";
import { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AppContext } from "./App";

const CreateVotes = () => {
  const { contract, connected, isMember } = useContext(AppContext);
  const [uri, setUri] = useState("");
  const [options, setOptions] = useState(2);
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check for IPFS URI passed from the generator
  useEffect(() => {
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
      
      alert("Vote created successfully!");
      setUri("");
      setOptions(2);
      setEndDate("");
      
      navigate("/votes");
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

  if (!connected) {
    return (
      <div className="text-center my-5">
        <Alert variant="warning">
          Please connect to MetaMask to create votes
        </Alert>
      </div>
    );
  }

  if (!isMember) {
    return (
      <div className="text-center my-5">
        <Alert variant="warning">
          You need to become a member to create votes
        </Alert>
      </div>
    );
  }

  return (
    <Form className="m-2">
      <h2 className="d-flex justify-content-center">Create a Vote</h2>
      
      
      
      <Form.Group className="m-2">
        <Form.Label>IPFS URI</Form.Label>
        <Form.Control 
          type="text" 
          name="uri" 
          value={uri}
          placeholder="IPFS URI (e.g., ipfs/QmYourHash...)"
          onChange={(e) => setUri(e.target.value)} 
        />
        <Form.Text className="text-muted">
          Enter the IPFS URI from our generator or your own IPFS hash in the format "ipfs/QmYourHash..."
        </Form.Text>
      </Form.Group>

      <Form.Group className="m-2">
        <Form.Label>Number of options</Form.Label>
        <Form.Control 
          type="number" 
          min={2}
          max={8}
          name="options" 
          value={options}
          onChange={(e) => setOptions(parseInt(e.target.value))} 
        />
        <Form.Text className="text-muted">
          This should match the number of options in your IPFS metadata
        </Form.Text>
      </Form.Group>

      <Form.Group className="m-2">
        <Form.Label>End Date</Form.Label>
        <Form.Control 
          type="date" 
          name="endDate" 
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)} 
        />
      </Form.Group>

      <Form.Group className="m-2 mt-4">
        <Button 
          variant="success" 
          onClick={createVote}
          disabled={loading}
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
              Creating...
            </>
          ) : (
            "Create"
          )}
        </Button>
      </Form.Group>
    </Form>
  );
};

export default CreateVotes;