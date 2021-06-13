import { useEffect, useState } from "react";
import { Button, Container, Form } from "react-bootstrap";
import { useLocation } from "react-router";
import { SurveyCompilerForm } from "./SurveyCompilerForm";

function SurveyCompiler(props) {
    const location = useLocation();
    const idSurvey = location.state.idSurvey;
    const [user, setUser] = useState("");

    function submitSurvey() {
        //TODO
    }

    function handleUser(user) {
        setUser(user);
    }

    return (
        <>
            <Container fluid className="p-5">
            {
                user ?
                    <SurveyCompilerForm idSurvey={idSurvey} submitSurvey={submitSurvey}/>
                :
                    <UserForm handleUser={handleUser}/>
            }            
            </Container>
            
        </>
    );
}

function UserForm(props) {
    const handleUser = props.handleUser;
    const [user, setUser] = useState("");

    function handleSubmit(event) {
        event.preventDefault();
        handleUser(user);
    }
    return (
        <>
            <Form className="p-5 rounded" style={{background: "#310f38"}}>
                <Form.Group className="mb-3" controlId="formBasicName">
                    <Form.Label className="text-light">Who are you?</Form.Label>
                    <Form.Control type="text" placeholder="Enter your name" value={user} onChange={ev => setUser(ev.target.value)} />
                    <Form.Text className="text-muted">
                    Just type an username to understand who will compile the survey.
                    </Form.Text>
                </Form.Group> 

                <Button variant="primary" type="submit" onClick={handleSubmit}>
                    Submit
                </Button>   
            </Form>
        </>
    );
}

export {SurveyCompiler};