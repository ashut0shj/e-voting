import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Votes from "./Votes";
import CreateVotes from "./CreateVotes";
import NavBar from "./NavBar";
import "bootstrap/dist/css/bootstrap.min.css";
import { useState, useEffect } from "react";
import {connect, getContract} from "./contract";

console.log("Nappr Component Loaded");

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


  const handleinit = async () => {
    try {
      setConnected(true);
      
      const [contract, signer] = await getContract();
      setContract(contract);
  
      const address = await signer.getAddress();
      const isMem = await contract.members(address);
      setIsMember(isMem);
  
    } catch (err) {
      console.error("Error in handleinit:", err);
    }
  };
  

const connectCallback =  async () => {
  const {contract} = await connect();
  setContract(contract);
  if (contract){
    setConnected(true);
  }
};

const becomeMember = async () => {
  if (!contract){
    alert("Connect to the Metamask first");
    return ;
  }

  await contract.join().then(() => {
    alert("Joined");
    setIsMember(true);
  }).catch((error) => {
    alert(error.message);
  });

};



  return (
    <div className="App">
      <Router> 
        <NavBar connect = {connectCallback} 
                connected = {connected} 
                becomeMember = {becomeMember} 
                isMember = {isMember} />

        <div className="container">
          <Routes>
            <Route path="/create-vote" element={<CreateVotes  contract = {contract}/>} />
            <Route path="/votes" element={<Votes contract={contract}/>} />
          </Routes>
        </div>
      </Router>
      
    </div>
  );
}

export default App;
