import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Votes from "./Votes";
import CreateVotes from "./CreateVotes";
import UserDashboard from "./UserDashboard";
import IPFSGenerator from "./IPFSGenerator"; // Import the new component
import Home from "./Home"; 
import NavBar from "./NavBar";
import "bootstrap/dist/css/bootstrap.min.css";
import { useState, useEffect, createContext } from "react";
import {connect, getContract} from "./contract";

export const AppContext = createContext();

function App() {
  const [contract, setContract] = useState(null);
  const [connected, setConnected] = useState(false); 
  const [isMember, setIsMember] = useState(false);
  const [signer, setSigner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts && accounts.length > 0) {
          await handleInit();
        }
      } catch (err) {
        console.error("Error checking connection:", err);
      } finally {
        setLoading(false);
      }
    };

    checkConnection();

    const handleAccountsChanged = async (accounts) => {
      if (accounts.length > 0) {
        await handleInit();
      } else {
        setConnected(false);
        setContract(null);
        setSigner(null);
        setIsMember(false);
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    
    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, []);

  useEffect(() => {
    const checkMembership = async () => {
      if (contract && signer) {
        try {
          const address = await signer.getAddress();
          const isMem = await contract.members(address);
          setIsMember(isMem);
        } catch (err) {
          console.error("Error checking membership:", err);
        }
      }
    };
    
    checkMembership();
  }, [contract, signer]);

  const handleInit = async () => {
    try {
      const [contractInstance, signerInstance] = await getContract();
      
      setContract(contractInstance);
      setSigner(signerInstance);
      setConnected(true);
      
      if (contractInstance && signerInstance) {
        const address = await signerInstance.getAddress();
        const isMem = await contractInstance.members(address);
        setIsMember(isMem);
      }
    } catch (err) {
      console.error("Error in handleInit:", err);
      setConnected(false);
    }
  };
  
  const connectCallback = async () => {
    try {
      setLoading(true);
      const {contract: contractInstance, signer: signerInstance} = await connect();
      
      setContract(contractInstance);
      setSigner(signerInstance);
      setConnected(true);
      
      if (contractInstance && signerInstance) {
        const address = await signerInstance.getAddress();
        const isMem = await contractInstance.members(address);
        setIsMember(isMem);
      }
    } catch (err) {
      console.error("Error connecting:", err);
      setConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const becomeMember = async () => {
    if (!contract) {
      alert("Connect to Metamask first");
      return;
    }

    try {
      const tx = await contract.join();
      await tx.wait(); 
      
      setIsMember(true);
      alert("Successfully joined as a member!");
    } catch (error) {
      console.error("Error becoming member:", error);
      alert(error.message);
    }
  };

  const contextValue = {
    contract,
    connected,
    isMember,
    signer,
    loading,
    connectWallet: connectCallback,
    becomeMember
  };

  return (
    <AppContext.Provider value={contextValue}>
      <div className="App">
        <Router> 
          <NavBar />
          <div className="container">
            <Routes>
              <Route path="/create-vote" element={<CreateVotes />} />
              <Route path="/votes" element={<Votes />} />
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/generate-ipfs" element={<IPFSGenerator />} />
              <Route path="/" element={<Home />} />
            </Routes>
          </div>
        </Router>
      </div>
    </AppContext.Provider>
  );
}

export default App;