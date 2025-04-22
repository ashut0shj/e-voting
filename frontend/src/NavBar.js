import { useContext } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Button from "react-bootstrap/Button";
import { AppContext } from "./App";
import { Link } from "react-router-dom";

const NavBar = () => {
  const { connected, isMember, connectWallet, becomeMember } = useContext(AppContext);

  return (
    <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
      <Container fluid>
        <Navbar.Brand as={Link} to="/">Voting App</Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/votes">Votes</Nav.Link>
            <Nav.Link as={Link} to="/create-vote">Create Vote</Nav.Link>
            {connected && !isMember && (
              <Button variant="success" onClick={becomeMember}>
                Become member
              </Button>
            )}
          </Nav>
          <Nav className="ms-auto">
            {!connected ? (
              <Button variant="primary" onClick={connectWallet}>
                Connect to Metamask
              </Button>
            ) : (
              <p style={{ color: "white", margin: 0, padding: "8px 0" }}>Connected to Metamask</p>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;