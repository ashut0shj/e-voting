import { Button}  from "react-bootstrap";
import From from "react-bootstrap/Form";
import { useState } from "react";

const CreateVotes = ({contract}) => {
  const [uri, setUri] = useState("");
  const [options, setOptions] = useState(2);
  const [endDate, setEndDate] = useState("");

  const createVote = async () => {
    if(!contract){
      alert("Please connect to the Metamask first");
      return;
    }

    await contract
    .createVote(uri,  new Date(endDate).getTime(), options)
    .then(() => alert("Success"))
    .catch((e) => alert(e.message));
  };


  return(
  <From className="m-2">
    <h2 className="d-flex justify-content-center">Create a Vote</h2>
    <From.Group className="m-2">
      <From.Label>IPFS URI</From.Label>
      <From.Control 
        type="text" 
        name="uri" 
        value={uri}
        placeholder="IPFS URI"
        onChange={(e) => setUri(e.target.value)} 
      />
    </From.Group>

    <From.Group className="m-2">
      <From.Label>Number of options</From.Label>
      <From.Control 
        type="number" 
        min={2}
        max={8}
        name="options" 
        value={options}
        onChange={(e) => setOptions(e.target.value)} 
      />
    </From.Group>

    <From.Group className="m-2">
      <From.Label>End Date</From.Label>
      <From.Control 
        type="date" 
        name="endDate" 
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)} 
      />
    </From.Group>

    <From.Group className="m-2 mt-4">
      <Button 
        variant="success" 
        onClick={createVote}>Create</Button>
    </From.Group>
  </From>

  );

};

export default CreateVotes;