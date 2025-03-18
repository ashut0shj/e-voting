import "bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";
import { Container, Form, Button, Card } from "react-bootstrap";
import "./CreateVote.css";
const CreateVotes = () => {
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [option1, setOption1] = useState("");
  const [option2, setOption2] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Vote Created: ${title}`);
  };

  return (
    <div className="crazy-vote-page">
      <Container className="d-flex flex-column align-items-center justify-content-center">
        <Card className="vote-card text-white text-center p-4">
          <h2 className="vote-title">🚀 Create a Crazy Vote! 🎉</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                placeholder="Enter Vote Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="vote-input"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                type="number"
                placeholder="Duration in Days"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="vote-input"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                placeholder="Option 1"
                value={option1}
                onChange={(e) => setOption1(e.target.value)}
                className="vote-input"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                placeholder="Option 2"
                value={option2}
                onChange={(e) => setOption2(e.target.value)}
                className="vote-input"
              />
            </Form.Group>
            <Button type="submit" className="vote-btn">🔥 Create Vote 🔥</Button>
          </Form>
        </Card>
      </Container>
    </div>
  );
};

export default CreateVotes;
