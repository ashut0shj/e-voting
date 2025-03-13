import {BrowserRouter as Router , Routes, Route} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import CreateVotes from "../frontend/src/CreateVotes";
import Votes from "../frontend/src/Votes";
import Navbar from "../frontend/src/NavBar";

function App() {
  return (
    <div>
      <h1  style={{ color: "blue" }}>Hello World</h1>
      <Router> 
        <Navbar />
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
