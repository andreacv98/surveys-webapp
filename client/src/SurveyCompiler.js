import { useEffect, useState } from "react";
import { Button, Container, Form, ProgressBar, Badge, Alert } from "react-bootstrap";
import { useLocation } from "react-router";
import { SurveyCompilerForm } from "./SurveyCompilerForm";
import { answerSurvey } from "./utilities";

function SurveyCompiler(props) {
    const location = useLocation();
    const idSurvey = location.state.idSurvey;
    const [user, setUser] = useState("");
    const [loading, setLoading] = useState(false);
    const [insertedData, setInsertedData] = useState(false);

    useEffect(()=> {
        if(insertedData) {

            console.log("insert")
            console.log(insertedData);
            setLoading(true);
            answerSurvey(insertedData).then((res) => {
                // TODO
                setLoading(false);
            });
        }
        
    },[insertedData]);

    /*
    *   closedAnswers: array of Ids of closed answers chosen by user
    *   openAnswers: array of object composed by questionId and answer text associated
    */
    function submitSurvey(closedAnswers, openAnswers) {
        //TODO
        setInsertedData(
            {
                "idSurvey": idSurvey,
                "user": user,
                "closedAnswers": closedAnswers,
                "openAnswers": openAnswers
            }
        );
    }

    function handleUser(user) {
        setUser(user);
    }

    return (
        <>
            <Container fluid>
            {             
                loading ?
                    <>
                        <Badge variant="danger">Submitting your marvelous answers...</Badge>
                        <ProgressBar animated now={100} />
                    </>
                    :
                    null
                    
            }
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
    const [errorMessage, setErrorMessage] = useState("")

    function handleSubmit(event) {
        event.preventDefault();
        if(user !== "") {
            handleUser(user);
        } else {
            setErrorMessage("No empty user allowed");
        }
        
    }
    return (
        <>
            {errorMessage ? <Alert variant='danger'>{errorMessage}</Alert> : ''}
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