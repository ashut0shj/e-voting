import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "./App";
import { Container, Row, Col, Button, Alert, Spinner, Card, Badge, ProgressBar } from "react-bootstrap";
import { 
  ShieldLockFill, CheckCircleFill, PeopleFill, FileTextFill,
  GraphUpArrow, LightningFill, GearFill, ArrowRightCircleFill,
  BoxArrowRight, CodeSlash, HexagonFill, Clock,   HddNetwork, 
  FileEarmarkCode, 
  Globe, 
  Braces, 
  Database, 
  Layers 
} from "react-bootstrap-icons";

function Home() {
  const { contract, connected, isMember, connectWallet, becomeMember, loading } = useContext(AppContext);
  const [stats, setStats] = useState({
    totalVotes: 0,
    activeVotes: 0,
    totalMembers: 0
  });
  const [loadingStats, setLoadingStats] = useState(false);
  const [animateElements, setAnimateElements] = useState(false);

  useEffect(() => {
    if (contract) {
      fetchStats();
    }
    
    // Trigger animation after component mounts
    setTimeout(() => {
      setAnimateElements(true);
    }, 100);
    
    // Particle animation
    const createParticles = () => {
      const particleContainer = document.querySelector('.particle-container');
      if (!particleContainer) return;
      
      for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random position and size
        const size = Math.random() * 6 + 1;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        
        // Random animation duration and delay
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * 10;
        particle.style.animation = `floatParticle ${duration}s infinite ease-in-out ${delay}s`;
        
        particleContainer.appendChild(particle);
      }
    };
    
    createParticles();
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

  const features = [
    {
      icon: <ShieldLockFill size={24} />,
      title: "Secure & Tamper-Proof",
      description: "Using blockchain's immutable ledger technology ensures votes cannot be altered or deleted once recorded."
    },
    {
      icon: <GraphUpArrow size={24} />,
      title: "Complete Transparency",
      description: "All voting data is publicly verifiable on the Ethereum blockchain while maintaining voter privacy."
    },
    {
      icon: <LightningFill size={24} />,
      title: "Efficient Processing",
      description: "Smart contracts automate the vote counting process, eliminating manual counting errors and delays."
    },
    {
      icon: <PeopleFill size={24} />,
      title: "Decentralized Authority",
      description: "No central authority controls the system, giving power back to voters and preventing manipulation."
    }
  ];


  const howItWorks = [
    {
      number: "01",
      title: "Connect Your Wallet",
      description: "Link your Ethereum wallet to authenticate your identity on the blockchain network."
    },
    {
      number: "02",
      title: "Become a Voter",
      description: "Register as a verified voting Voter with a simple one-time transaction."
    },
    {
      number: "03",
      title: "Create or Cast Votes",
      description: "Participate in active votes or create new proposals for the community."
    }
  ];

  const techStack = [
    { 
      name: "Ethereum", 
      icon: <HddNetwork size={24} className="text-success" />,
      description: "Secure, decentralized blockchain foundation that powers all our smart contracts and transactions.",
      status: "Production"
    },
    { 
      name: "Solidity Smart Contracts", 
      icon: <FileEarmarkCode size={24} className="text-success" />,
      description: "Custom-built smart contracts with comprehensive security audits to protect user assets.",
      status: "Production"
    },
    { 
      name: "React Frontend", 
      icon: <Globe size={24} className="text-success" />,
      description: "Fast, responsive user interface built with React for optimal user experience across all devices.",
      status: "Production"
    },
    { 
      name: "Web3.js / Ethers.js", 
      icon: <Braces size={24} className="text-success" />,
      description: "Seamless blockchain integration allowing real-time transaction processing and wallet connectivity.",
      status: "Production"
    },
    { 
      name: "IPFS Storage", 
      icon: <Database size={24} className="text-success" />,
      description: "Decentralized file storage ensuring data permanence and censorship resistance.",
      status: "Testing"
    },
    { 
      name: "Layer 2 Scaling", 
      icon: <Layers size={24} className="text-success" />,
      description: "Next-generation scaling solutions to improve transaction speeds and reduce gas fees.",
      status: "Development"
    }
  ];
  

  return (
    <>
      {/* Custom CSS for animation and effects */}
      <style>
        {`
          @keyframes floatParticle {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-100px) rotate(180deg); }
          }
          
          .particle-container {
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            overflow: hidden;
            z-index: 0;
          }
          
          .particle {
            position: absolute;
            background: rgba(155, 85, 255, 0.2);
            border-radius: 50%;
            pointer-events: none;
          }
          
          .animate-in {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.6s ease-out, transform 0.6s ease-out;
          }
          
          .animate-in.show {
            opacity: 1;
            transform: translateY(0);
          }
          
          .animate-in-delay-1 {
            transition-delay: 0.2s;
          }
          
          .animate-in-delay-2 {
            transition-delay: 0.4s;
          }
          
          .animate-in-delay-3 {
            transition-delay: 0.6s;
          }
          
          .animate-in-delay-4 {
            transition-delay: 0.8s;
          }
          
          .hexagon-bg {
            position: absolute;
            z-index: -1;
            opacity: 0.1;
          }
          
          .hero-glow {
            position: absolute;
            width: 80%;
            height: 80%;
            top: 10%;
            left: 10%;
            background: radial-gradient(circle at center, rgba(155, 85, 255, 0.15) 0%, transparent 70%);
            z-index: -1;
            animation: pulse 4s infinite alternate ease-in-out;
          }
          
          @keyframes pulse {
            0% { opacity: 0.3; transform: scale(1); }
            100% { opacity: 0.6; transform: scale(1.1); }
          }
          
          .code-block {
            background-color: var(--dark-medium);
            border-radius: var(--button-border-radius);
            font-family: 'Fira Code', monospace;
            color: #e0e0e0;
            padding: 1.5rem;
            position: relative;
            overflow: hidden;
          }
          
          .code-block::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 4px;
            background: linear-gradient(90deg, var(--primary), var(--primary-light));
          }
          
          .code-comment {
            color: #6c757d;
          }
          
          .code-keyword {
            color: var(--primary-light);
          }
          
          .code-function {
            color: var(--info);
          }
          
          .code-string {
            color: var(--success);
          }
          
          .dashboard-stat {
            overflow: hidden;
          }
          
          .dashboard-stat::after {
            content: '';
            position: absolute;
            width: 100px;
            height: 100px;
            background: radial-gradient(circle, rgba(155, 85, 255, 0.2) 0%, transparent 70%);
            bottom: -50px;
            right: -50px;
            border-radius: 50%;
          }
          
          .stat-icon {
            position: absolute;
            right: 20px;
            bottom: 20px;
            font-size: 3rem;
            opacity: 0.2;
          }
        `}
      </style>

      {/* Hero Section */}
        
        <div className="hero-section position-relative">
          <div className="particle-container"></div>
          <div className="hero-glow"></div>
          
          <Container className="position-relative z-1">
            <Row className="align-items-center">
              <Col lg={7} className="text-center text-lg-start mb-5 mb-lg-0">
                <div className={`animate-in ${animateElements ? 'show' : ''}`}>
                  <h1 className="hero-title">
                    <span className="gradient-text">Decentralized</span> E-Voting
                  </h1>
                  <p className="hero-subtitle">
                    A next-generation voting platform built on Ethereum blockchain technology
                    that ensures transparency, security, and immutability for all votes.
                  </p>
                  
                  {!connected ? (
                    <Button 
                      variant="primary" 
                      size="lg" 
                      onClick={connectWallet} 
                      disabled={loading}
                      className="btn-connect me-3"
                    >
                      {loading ? (
                        <>
                          <Spinner as="span" animation="border" size="sm" className="me-2" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <BoxArrowRight className="me-2" /> Connect Wallet
                        </>
                      )}
                    </Button>
                  ) : !isMember ? (
                    <Button 
                      variant="success" 
                      size="lg" 
                      onClick={becomeMember}
                      className="me-3"
                    >
                      <PeopleFill className="me-2" /> Become a Voter
                    </Button>
                  ) : (
                    <Link to="/create-vote">
                      <Button variant="primary" size="lg" className="me-3">
                        <FileTextFill className="me-2" /> Create Vote
                      </Button>
                    </Link>
                  )}
                  
                  <Link to="/votes">
                    <Button variant="outline-primary" size="lg">
                      Explore Votes
                    </Button>
                  </Link>
                </div>
              </Col>
              
              <Col lg={5}>
                <div className={`code-block animate-in animate-in-delay-2 ${animateElements ? 'show' : ''}`}>
                  <div className="mb-2"><span className="code-comment">// Smart Contract Interface</span></div>
                  <div><span className="code-keyword">contract</span> <span className="code-function">DecentralVoting</span> {'{'}</div>
                  <div className="ms-4"><span className="code-keyword">function</span> <span className="code-function">createVote</span>(<span className="code-keyword">string</span> title, <span className="code-keyword">string</span> description) <span className="code-keyword">public</span> {'{'}</div>
                  <div className="ms-5"><span className="code-comment">// Create new vote proposal</span></div>
                  <div className="ms-4">{'}'}</div>
                  <div className="ms-4"><span className="code-keyword">function</span> <span className="code-function">castVote</span>(<span className="code-keyword">uint</span> voteId, <span className="code-keyword">uint</span> choice) <span className="code-keyword">public</span> {'{'}</div>
                  <div className="ms-5"><span className="code-comment">// Record immutable vote on chain</span></div>
                  <div className="ms-4">{'}'}</div>
                  <div>{'}'}</div>
                </div>
              </Col>
            </Row>
          </Container>
        </div>


        {/* Stats Section - Only shown when connected */}
        {connected && (
          <section className="py-5">
            <Container>
              <h2 className={`text-center mb-5 animate-in ${animateElements ? 'show' : ''}`}>
                <Badge bg="primary" className="mb-2">Live Stats</Badge>
                <div>Platform Metrics</div>
              </h2>
              
              <Row>
                <Col lg={4} className="mb-4">
                  <div className={`dashboard-stat position-relative animate-in animate-in-delay-1 ${animateElements ? 'show' : ''}`}>
                    <div className="stat-icon">
                      <FileTextFill />
                    </div>
                    <div className="stat-value mb-2">
                      {loadingStats ? <Spinner animation="border" size="sm" /> : stats.totalVotes}
                    </div>
                    <div className="stat-label">Total Votes</div>
                    <p className="mt-2 text-gray-light">All votes created on the platform</p>
                    <Link to="/votes">
                      <Button variant="outline-primary" className="mt-2">
                        View All <ArrowRightCircleFill className="ms-1" />
                      </Button>
                    </Link>
                  </div>
                </Col>
                
                <Col lg={4} className="mb-4">
                  <div className={`dashboard-stat position-relative animate-in animate-in-delay-2 ${animateElements ? 'show' : ''}`}>
                    <div className="stat-icon">
                      <Clock />
                    </div>
                    <div className="stat-value mb-2">
                      {loadingStats ? <Spinner animation="border" size="sm" /> : stats.activeVotes}
                    </div>
                    <div className="stat-label">Active Votes</div>
                    <p className="mt-2 text-gray-light">Ongoing votes that need your participation</p>
                    <Link to="/votes">
                      <Button variant="outline-success" className="mt-2">
                        Vote Now <ArrowRightCircleFill className="ms-1" />
                      </Button>
                    </Link>
                  </div>
                </Col>
                
                <Col lg={4} className="mb-4">
                  <div className={`dashboard-stat position-relative animate-in animate-in-delay-3 ${animateElements ? 'show' : ''}`}>
                    <div className="stat-icon">
                      <PeopleFill />
                    </div>
                    <div className="stat-value mb-2">
                      {loadingStats ? <Spinner animation="border" size="sm" /> : stats.totalMembers}
                    </div>
                    <div className="stat-label">Community Members</div>
                    <p className="mt-2 text-gray-light">Members who can participate in voting</p>
                    <Link to="/dashboard">
                      <Button variant="outline-info" className="mt-2">
                        View Dashboard <ArrowRightCircleFill className="ms-1" />
                      </Button>
                    </Link>
                  </div>
                </Col>
              </Row>
            </Container>
          </section>
        )}

        {/* Alert for Non-Members */}
        {connected && !isMember && (
          <Container className="mb-5">
            <Alert variant="info" className={`animate-in ${animateElements ? 'show' : ''}`}>
              <Alert.Heading>Become a voter to Participate</Alert.Heading>
              <p>
                You need to be a registered voter to create votes and participate in the decision-making process.
                Registration requires a simple transaction to verify your identity on the blockchain.
              </p>
              <div className="d-flex justify-content-end">
                <Button variant="success" onClick={becomeMember}>
                  <PeopleFill className="me-2" /> Register Now
                </Button>
              </div>
            </Alert>
          </Container>
        )}

        {/* Features Section */}
        <section className="py-5 bg-dark-light">
          <Container>
            <div className="text-center mb-5">
              <Badge bg="primary" className="mb-2">Why Choose Us</Badge>
              <h2 className="display-5 mb-4">Platform Features</h2>
              <p className="lead text-gray-light mb-5">
                Our blockchain-based voting system provides advantages that traditional voting systems cannot match
              </p>
            </div>
            
            <Row>
              {features.map((feature, index) => (
                <Col lg={3} md={6} className="mb-4" key={index}>
                  <Card className={`h-100 animate-in animate-in-delay-${index % 4 + 1} ${animateElements ? 'show' : ''}`}>
                    <Card.Body>
                      <div className="text-primary mb-3">
                        {feature.icon}
                      </div>
                      <Card.Title>{feature.title}</Card.Title>
                      <Card.Text className="text-white-50">
                        {feature.description}
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Container>
        </section>

        {/* How It Works Section */}
        <section className="py-5">
          <Container>
            <div className="text-center mb-5">
              <Badge bg="info" className="mb-2">Getting Started</Badge>
              <h2 className="display-5 mb-4">How It Works</h2>
              <p className="lead text-gray-light">
                Start participating in secure, transparent voting in just three easy steps
              </p>
            </div>
            
            <Row className="justify-content-center">
              {howItWorks.map((step, index) => (
                <Col lg={4} md={6} className="mb-4" key={index}>
                  <Card className={`vote-card animate-in animate-in-delay-${index % 3 + 1} ${animateElements ? 'show' : ''}`}>
                    <Card.Body className="p-4">
                      <div className="position-relative mb-4">
                        <div className="gradient-text display-4 fw-bold">{step.number}</div>
                        <div className="position-absolute bottom-0 start-0 w-25 h-1 bg-primary"></div>
                      </div>
                      <Card.Title className="mb-3">{step.title}</Card.Title>
                      <Card.Text className="text-white-50">
                        {step.description}
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Container>
        </section>

{/* Technology Stack */}
<section className="py-5 bg-dark-light">
      <Container>
        <div className="text-center mb-5">
          <Badge bg="success" className="mb-2">Technology</Badge>
          <h2 className="display-5 mb-4 text-white">Built With Modern Tech</h2>
          <p className="lead text-light">
            Our platform leverages cutting-edge blockchain technology for maximum security and transparency
          </p>
        </div>
        
        <Row className="justify-content-center g-4">
          {techStack.map((tech, index) => (
            <Col key={index} md={6} lg={4}>
              <div className={`card h-100 tech-card bg-dark border-secondary animate-in ${animateElements ? 'show' : ''}`}>
                <div className="card-body d-flex flex-column p-4">
                  <div className="tech-icon mb-3">
                    {tech.icon}
                  </div>
                  <h4 className="card-title mb-2 text-light">{tech.name}</h4>
                  <p className="card-text text-light-gray flex-grow-1">{tech.description}</p>
                  <div className="mt-auto">
                    <Badge bg={tech.status === "Production" ? "success" : 
                              tech.status === "Testing" ? "warning" : "info"}>
                      {tech.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>

        {/* CTA Section for Members */}
        {connected && isMember && (
          <section className="py-5">
            <Container>
              <Row className="gx-4 gy-4">
                <Col md={6}>
                  <Card className={`shadow-sm vote-card animate-in animate-in-delay-1 ${animateElements ? 'show' : ''}`}>
                    <Card.Body className="p-4">
                      <div className="mb-3 text-primary">
                        <FileTextFill size={28} />
                      </div>
                      <Card.Title className="mb-3">Create a New Vote</Card.Title>
                      <Card.Text className="text-white mb-4">
                        Start a new blockchain-secured proposal and let the community decide. 
                        All votes are transparently recorded on the Ethereum network.
                      </Card.Text>
                      <Link to="/create-vote">
                        <Button variant="primary" className="vote-button">
                          Create Vote <ArrowRightCircleFill className="ms-2" />
                        </Button>
                      </Link>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className={`shadow-sm vote-card animate-in animate-in-delay-2 ${animateElements ? 'show' : ''}`}>
                    <Card.Body className="p-4">
                      <div className="mb-3 text-info">
                        <GearFill size={28} />
                      </div>
                      <Card.Title className="mb-3">Your Dashboard</Card.Title>
                      <Card.Text className="text-white mb-4">
                        View your voting activity, created proposals, and membership status.
                        Track your impact on community decisions in real-time.
                      </Card.Text>
                      <Link to="/dashboard">
                        <Button variant="info" className="vote-button">
                          Go to Dashboard <ArrowRightCircleFill className="ms-2" />
                        </Button>
                      </Link>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Container>
          </section>
        )}

        {/* Why Blockchain Section */}
        <section className="py-5 bg-dark-medium">
          <Container>
            <Row className="align-items-center">
              <Col lg={5} className="mb-4 mb-lg-0">
                <div className={`pe-lg-4 animate-in ${animateElements ? 'show' : ''}`}>
                  <Badge bg="warning" className="mb-2">The Technology</Badge>
                  <h2 className="display-5 mb-4">Why Blockchain Voting?</h2>
                  <p className="text-gray-light mb-4">
                    Traditional voting systems are vulnerable to fraud, manipulation, and lack of transparency.
                    Blockchain technology solves these issues through:
                  </p>
                  <ul className="list-unstyled">
                    <li className="mb-3 d-flex align-items-start">
                      <CheckCircleFill className="text-success me-2 mt-1" />
                      <span>Immutable records that cannot be altered once recorded</span>
                    </li>
                    <li className="mb-3 d-flex align-items-start">
                      <CheckCircleFill className="text-success me-2 mt-1" />
                      <span>Decentralized verification by multiple network nodes</span>
                    </li>
                    <li className="mb-3 d-flex align-items-start">
                      <CheckCircleFill className="text-success me-2 mt-1" />
                      <span>Cryptographic security protecting vote integrity</span>
                    </li>
                    <li className="mb-3 d-flex align-items-start">
                      <CheckCircleFill className="text-success me-2 mt-1" />
                      <span>Transparent yet private voting processes</span>
                    </li>
                  </ul>
                </div>
              </Col>
              
              <Col lg={7}>
                <div className={`position-relative animate-in animate-in-delay-2 ${animateElements ? 'show' : ''}`}>
                  {/* Blockchain illustration */}
                  <div className="card code-block">
                    <div className="d-flex flex-wrap">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="p-3 m-2 bg-dark rounded position-relative" style={{width: "calc(33% - 16px)"}}>
                          <div className="d-flex justify-content-between mb-2">
                            <small className="text-muted">Block #{new Date().getTime() + i}</small>
                            <Badge bg="primary" pill>New</Badge>
                          </div>
                          <div className="mb-1 small text-truncate">
                            <span className="text-muted">Hash:</span> 0x{Math.random().toString(36).substring(2, 15)}
                          </div>
                          <div className="mb-1 small">
                            <span className="text-muted">Votes:</span> <span className="text-success">{Math.floor(Math.random() * 10) + 1}</span>
                          </div>
                          <div className="small">
                            <span className="text-muted">Time:</span> {Math.floor(Math.random() * 60)} sec ago
                          </div>
                          <div className="position-absolute" style={{bottom: "10px", right: "10px"}}>
                            <HexagonFill size={14} className="text-primary-light" />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 text-center text-muted small">
                      <CodeSlash className="me-1" /> Live blockchain transaction visualization
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </section>

        {/* Final CTA Section */}
        <section className="py-5">
          <Container className="text-center">
            <div className={`animate-in ${animateElements ? 'show' : ''}`}>
              <Badge bg="primary" className="mb-3">Get Started Now</Badge>
              <h2 className="display-5 mb-4">Ready to Transform Voting?</h2>
              <p className="lead text-gray-light mb-5 mx-auto" style={{maxWidth: "700px"}}>
                Join our community of forward-thinking individuals and organizations
                using blockchain technology to make voting more secure, transparent, and accessible.
              </p>
              
              {!connected ? (
                <Button 
                  variant="primary" 
                  size="lg" 
                  onClick={connectWallet} 
                  disabled={loading}
                  className="btn-connect me-3"
                >
                  {loading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" className="me-2" />
                      Connecting...
                    </>
                  ) : (
                    "Connect Your Wallet"
                  )}
                </Button>
              ) : !isMember ? (
                <Button 
                  variant="success" 
                  size="lg" 
                  onClick={becomeMember}
                  className="me-3 "
                >
                  Become a Voter
                </Button>
              ) : (
                <Link to="/votes">
                  <Button variant="primary" size="lg" className="me-3">
                    Explore Active Votes
                  </Button>
                </Link>
              )}
              
              <Link to="/about">
                <Button variant="outline-primary" size="lg">
                  Learn More
                </Button>
              </Link>
            </div>
          </Container>
        </section>
      
    </>
  );
}

export default Home;