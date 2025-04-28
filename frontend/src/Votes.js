import { useState, useEffect } from "react";

const VotingDemo = () => {
  const [votes, setVotes] = useState([]);
  const [filteredVotes, setFilteredVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // "all", "active", "ended"
  const [animateElements, setAnimateElements] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState({});

  // Add animation trigger
  useEffect(() => {
    setTimeout(() => {
      setAnimateElements(true);
    }, 100);
  }, []);

  // Mock vote data for demo purposes
  useEffect(() => {
    const mockData = [
      {
        id: 1,
        owner: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
        description: "How will I live?",
        options: ["I won't", "Ice cream", "Nahhh", "Mehhh"],
        votes: [12, 24, 8, 16],
        endTime: Date.now() + 172800000, // 2 days from now
        ipfsData: {
          description: "How will I live?",
          options: ["I won't", "Ice cream", "Nahhh", "Mehhh"]
        }
      },
      {
        id: 2,
        owner: "0x3A56af46CC06dAA1B670a514F7c77B5180cc3Ff5",
        description: "What is the best breakfast?",
        options: ["Bread", "Eggs", "Poha", "Fruit"],
        votes: [18, 35, 22, 15],
        endTime: Date.now() + 86400000, // 1 day from now
        ipfsData: {
          description: "What is the best breakfast?",
          options: ["Bread", "Eggs", "Poha", "Fruit"]
        }
      },
      {
        id: 3,
        owner: "0x9A67F1940164d0318612b497E8e6038f902a00a4",
        description: "Which programming language is best for beginners?",
        options: ["Python", "JavaScript", "Go", "Ruby"],
        votes: [45, 28, 12, 9],
        endTime: Date.now() - 86400000, // 1 day ago (ended)
        ipfsData: {
          description: "Which programming language is best for beginners?",
          options: ["Python", "JavaScript", "Go", "Ruby"]
        }
      },
      {
        id: 4,
        owner: "0x1B67F1940164d0318612b497E8e6038f902a00a4",
        description: "Should remote work be the new normal?",
        options: ["Yes, for all industries", "Only for tech", "Hybrid model", "No, in-person is better"],
        votes: [25, 18, 42, 7],
        endTime: Date.now() + 345600000, // 4 days from now
        ipfsData: {
          description: "Should remote work be the new normal?",
          options: ["Yes, for all industries", "Only for tech", "Hybrid model", "No, in-person is better"]
        }
      },
      {
        id: 5,
        owner: "0xAC88F1940164d0318612b497E8e6038f902a00a4",
        description: "Which blockchain has the best developer experience?",
        options: ["Ethereum", "Solana", "Polkadot", "Cardano"],
        votes: [31, 26, 14, 19],
        endTime: Date.now() - 172800000, // 2 days ago (ended)
        ipfsData: {
          description: "Which blockchain has the best developer experience?",
          options: ["Ethereum", "Solana", "Polkadot", "Cardano"]
        }
      }
    ];

    setVotes(mockData);
    setFilteredVotes(mockData);
    setLoading(false);
  }, []);

  const formatTimeRemaining = (endTime) => {
    const now = Date.now();
    
    if (endTime <= now) {
      return { text: "Voting ended", ended: true };
    }
    
    const totalMs = endTime - now;
    const days = Math.floor(totalMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((totalMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((totalMs % (1000 * 60)) / 1000);
    
    const displayDays = Math.max(0, Math.min(days, 999));
    
    let text = "";
    if (displayDays > 0) {
      text = `${displayDays}d ${hours}h remaining`;
    } else if (hours > 0) {
      text = `${hours}h ${minutes}m remaining`;
    } else if (minutes > 0) {
      text = `${minutes}m ${seconds}s remaining`;
    } else {
      text = `${seconds}s remaining`;
    }
    
    return { 
      days: displayDays, 
      hours, 
      minutes,
      seconds,
      text,
      ended: false,
      timeLeft: totalMs
    };
  };

  useEffect(() => {
    const updateAllTimeRemaining = () => {
      const updatedTimeRemaining = {};
      
      votes.forEach(vote => {
        updatedTimeRemaining[vote.id] = formatTimeRemaining(vote.endTime);
      });
      
      setTimeRemaining(updatedTimeRemaining);
    };
    
    if (votes.length > 0) {
      updateAllTimeRemaining();
    }
    
    const intervalId = setInterval(updateAllTimeRemaining, 1000); // Update every second
    
    return () => clearInterval(intervalId);
  }, [votes]);

  // Filter and search functionality
  useEffect(() => {
    let filtered = [...votes];
    
    // Apply status filter
    if (filterStatus === "active") {
      filtered = filtered.filter(vote => vote.endTime > Date.now());
    } else if (filterStatus === "ended") {
      filtered = filtered.filter(vote => vote.endTime <= Date.now());
    }
    
    // Apply search term filter if it exists
    if (searchTerm.trim() !== "") {
      const lowercasedSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(vote => {
        // Search by ID
        if (vote.id.toString().includes(lowercasedSearch)) {
          return true;
        }
        
        // Search by owner address
        if (vote.owner.toLowerCase().includes(lowercasedSearch)) {
          return true;
        }
        
        // Search by description
        if (vote.description.toLowerCase().includes(lowercasedSearch)) {
          return true;
        }
        
        // Search by options
        return vote.options.some(option => 
          option.toLowerCase().includes(lowercasedSearch)
        );
      });
    }
    
    setFilteredVotes(filtered);
  }, [searchTerm, votes, filterStatus]);

  const calculateTotalVotes = (voteArray) => {
    return voteArray.reduce((total, count) => total + count, 0);
  };

  // Truncate wallet address for display
  const truncateAddress = (address) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Function to simulate voting (just visual feedback for demo)
  const simulateVote = (voteId, optionIndex) => {
    const updatedVotes = [...votes];
    const voteIndex = updatedVotes.findIndex(v => v.id === voteId);
    
    if (voteIndex !== -1) {
      // Create a copy of the votes array for the specific vote
      const newVotesArray = [...updatedVotes[voteIndex].votes];
      // Increment the vote count for the selected option
      newVotesArray[optionIndex] += 1;
      
      // Update the vote in our state
      updatedVotes[voteIndex] = {
        ...updatedVotes[voteIndex],
        votes: newVotesArray
      };
      
      setVotes(updatedVotes);
      
      // Show visual feedback
      alert("Vote simulated! (This is just a frontend demo)");
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className={`mb-12 animate-in ${animateElements ? 'show' : ''}`}>
          <span className="inline-block bg-blue-600 text-white text-sm font-semibold px-3 py-1 rounded-full mb-2">Blockchain Governance</span>
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">Community Voting</h1>
          <p className="text-gray-300 opacity-75">Participate in transparent and secure voting on the blockchain</p>
        </div>
        
        {/* Search and Filter Section */}
        <div className={`bg-gray-800 bg-opacity-60 rounded-xl p-6 mb-8 shadow-lg backdrop-blur-md border border-gray-700 animate-in ${animateElements ? 'show' : ''}`}>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
                <input
                  type="text"
                  className="bg-gray-900 bg-opacity-60 text-white pl-10 pr-4 py-3 w-full rounded-lg border border-gray-700 focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-25"
                  placeholder="Search by title, options, or creator address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button 
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setSearchTerm("")}
                  >
                    <svg className="w-5 h-5 text-gray-400 hover:text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                    </svg>
                  </button>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button 
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filterStatus === "all" ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                onClick={() => setFilterStatus("all")}
              >
                All Votes
              </button>
              <button 
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filterStatus === "active" ? 'bg-green-600 text-white shadow-md' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                onClick={() => setFilterStatus("active")}
              >
                Active Votes
              </button>
              <button 
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filterStatus === "ended" ? 'bg-red-600 text-white shadow-md' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                onClick={() => setFilterStatus("ended")}
              >
                Ended Votes
              </button>
            </div>
          </div>
        </div>
        
        {/* Votes Display */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : filteredVotes.length === 0 ? (
          <div className={`bg-gray-800 bg-opacity-60 rounded-xl p-12 text-center shadow-lg backdrop-blur-md border border-gray-700 animate-in ${animateElements ? 'show' : ''}`}>
            <div className="text-5xl text-purple-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">No Matches Found</h3>
            <p className="text-gray-400 mb-6">No votes match your current search criteria</p>
            <button 
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-all"
              onClick={() => {
                setSearchTerm("");
                setFilterStatus("all");
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredVotes.map((vote, voteIndex) => {
              const votingEnded = vote.endTime < Date.now();
              const totalVotes = calculateTotalVotes(vote.votes);
              const remaining = timeRemaining[vote.id] || formatTimeRemaining(vote.endTime);
              const winningOptionIndex = vote.votes.indexOf(Math.max(...vote.votes));
              
              return (
                <div 
                  key={vote.id} 
                  className={`bg-gray-800 bg-opacity-80 rounded-xl overflow-hidden shadow-lg border border-gray-700 relative animate-in animate-in-delay-${voteIndex % 3 + 1} ${animateElements ? 'show' : ''}`}
                >
                  <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-purple-600 opacity-10 blur-2xl pointer-events-none"></div>
                  
                  <div className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700 p-4 md:p-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center">
                        <span className="bg-gray-900 text-gray-300 px-3 py-2 rounded-lg mr-3 text-sm font-mono">
                          #{vote.id}
                        </span>
                        <h3 className="text-xl font-semibold text-white overflow-hidden text-ellipsis">
                          {vote.description}
                        </h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${votingEnded ? 'bg-red-600 bg-opacity-20 text-red-400' : 'bg-green-600 bg-opacity-20 text-green-400'}`}>
                          {votingEnded ? (
                            <>
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                              </svg>
                              Voting Ended
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path>
                              </svg>
                              Voting Active
                            </>
                          )}
                        </span>
                        
                        {!votingEnded && (
                          <span className={`px-3 py-1 rounded-full bg-blue-600 bg-opacity-20 text-blue-400 text-sm font-medium flex items-center ${remaining.days === 0 && remaining.hours < 12 ? 'animate-pulse' : ''}`}>
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            {remaining.text}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 md:p-6">
                    <div className="flex flex-wrap gap-4 items-center pb-4 mb-4 border-b border-gray-700">
                      <div className="flex items-center text-gray-400 text-sm">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                        Created by: {truncateAddress(vote.owner)}
                      </div>
                      
                      <div className="flex items-center text-gray-400 text-sm">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Total Votes: <span className="font-semibold ml-1">{totalVotes}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-4 mb-4">
                      {vote.options.map((option, index) => {
                        const count = vote.votes[index];
                        const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                        const isWinningOption = index === winningOptionIndex && count > 0;
                        
                        return (
                          <div 
                            key={index} 
                            className={`bg-gray-900 bg-opacity-50 rounded-lg border p-4 relative overflow-hidden transition-all ${
                              isWinningOption 
                                ? 'border-green-500 bg-green-900 bg-opacity-10' 
                                : 'border-gray-700 hover:border-gray-600'
                            }`}
                          >
                            {votingEnded && isWinningOption && (
                              <span className="absolute top-0 left-4 transform -translate-y-1/2 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                  <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" clipRule="evenodd"></path>
                                  <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z"></path>
                                </svg>
                                Winner
                              </span>
                            )}
                            
                            <div className="flex justify-between mb-2">
                              <span className="font-medium">{option}</span>
                              <span>
                                <strong>{count}</strong> {count === 1 ? 'vote' : 'votes'} ({percentage}%)
                              </span>
                            </div>
                            
                            <div className="relative">
                              <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
                                  style={{ width: `${percentage > 0 ? percentage : 3}%` }}
                                ></div>
                              </div>
                              {percentage > 10 && (
                                <span className="absolute right-0 top-0 transform translate-y-4 text-xs text-gray-400">
                                  {percentage}%
                                </span>
                              )}
                            </div>
                            
                            {!votingEnded && (
                              <div className="mt-4 text-right">
                                <button 
                                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-full transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                                  onClick={() => simulateVote(vote.id, index)}
                                >
                                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                  </svg>
                                  Cast Vote (Demo)
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    
                    {votingEnded && totalVotes > 0 && winningOptionIndex !== -1 && (
                      <div className="bg-green-900 bg-opacity-20 border border-green-500 text-green-300 rounded-lg p-4 flex items-start">
                        <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" clipRule="evenodd"></path>
                          <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z"></path>
                        </svg>
                        <div>
                          <span className="font-semibold">Final Result:</span> {vote.options[winningOptionIndex]} won with {vote.votes[winningOptionIndex]} {vote.votes[winningOptionIndex] === 1 ? 'vote' : 'votes'} 
                          ({Math.round((vote.votes[winningOptionIndex] / totalVotes) * 100)}%)
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Custom CSS for animations */}
      <style jsx global>{`
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
      `}</style>
    </div>
  );
};

export default VotingDemo;