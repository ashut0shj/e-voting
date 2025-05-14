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
import "./styles.css";


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

  useEffect(() => {
    const createParticles = () => {
      const particleContainer = document.querySelector('.particle-container');
      if (!particleContainer) return;
      
      particleContainer.innerHTML = '';
      
      for (let i = 0; i < 80; i++) { // More stars
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random properties
        const size = Math.random() * 3 + 4; // Smaller stars (1-4px)
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        
        // Faster animation
        const duration = Math.random() * 10 + 5; // 5-15s duration
        const delay = Math.random() * 5;
        particle.style.animation = `floatParticle ${duration}s infinite ease-in-out ${delay}s`;
        
        // Subtle visibility
        particle.style.opacity = Math.random() * 0.6 + 0.1;
        
        particleContainer.appendChild(particle);
      }
    };
  
    // Mouse interaction effect
    const handleMouseMove = (e) => {
      const particles = document.querySelectorAll('.particle');
      const mouseX = e.clientX / window.innerWidth;
      const mouseY = e.clientY / window.innerHeight;
      
      particles.forEach(particle => {
        // Calculate distance from mouse
        const particleX = parseFloat(particle.style.left) / 100;
        const particleY = parseFloat(particle.style.top) / 100;
        const distance = Math.sqrt(
          Math.pow(mouseX - particleX, 2) + 
          Math.pow(mouseY - particleY, 2)
        );
        
        // Push particles away from mouse
        if (distance < 0.2) {
          const pushForce = (0.2 - distance) * 0.08;
          const angle = Math.atan2(
            particleY - mouseY,
            particleX - mouseX
          );
          
          particle.style.transform = `translate(
            ${Math.cos(angle) * pushForce * 100}px,
            ${Math.sin(angle) * pushForce * 100}px
          )`;
        } else {
          particle.style.transform = 'translate(0, 0)';
        }
      });
    };
  
    createParticles();
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', createParticles);
    
    return () => {
      window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', createParticles);
    };
  }, []);

  


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
          <div className="particle-container"></div>
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