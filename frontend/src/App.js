import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Votes from "./Votes";
import CreateVotes from "./CreateVotes";
import NavBar from "./NavBar";
import "bootstrap/dist/css/bootstrap.min.css";
import { useState, useEffect } from "react";
import {connect, getContract} from "./contract";


function App() {

  const [contract, setContract] = useState(null);
  const [connected, setConnected] = useState(false); 
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    window.ethereum.request({ method: 'eth_accounts' }).then(accounts => {
      if (accounts.length > 0) {
        handleinit();
      }
      else{
        setConnected(false);
      }
    });

  }, []);


  const handleinit = () => {
     setConnected(true);
     const [contract, signer] = getContract();
     setContract(contract);

     if(contract){
      signer.getAddress().then(address => {
        contract.member(address).then(result => {
          setIsMember(result);
        });
      });
     }
  }

  return (
    <div className="App">
      <Router> 
        <NavBar />
        <div className="container">
          <Routes>
            <Route path="/create-vote" element={<CreateVotes />} />
            <Route path="/votes" element={<Votes />} />
          </Routes>
        </div>
      </Router>
      
    </div>
  );
}

export default App;
