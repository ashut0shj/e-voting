import "bootstrap/dist/css/bootstrap.min.css";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Button from "react-bootstrap/Button";

const NavBar = ({connect, connected, becomeMember, isMember}) => {
  console.log("Navbar Component Loaded");

  return (
    <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
      <Container fluid>
        <Navbar.Brand href="/">Voting App</Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/votes">Votes</Nav.Link>
            <Nav.Link href="/create-vote">Create Vote</Nav.Link>
            {!isMember && (
              <Button variant="success" onClick={becomeMember}>
                Become member
              </Button>)}
          </Nav>
          <Nav className="ms-auto">
            {!connected ? (
              <Button variant="primary" onClick={connect}>
                Connect to Metamask
              </Button>
            ) : (
              <p style = {{color: "white"}} >Connected to Metamask</p>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
