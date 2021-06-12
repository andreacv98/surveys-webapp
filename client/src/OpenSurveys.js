import { useEffect, useState } from "react";
import { Card, Container, Button, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import { getOpenSurveys } from "./utilities";

function OpenSurveys(props) {

    const [openSurveys, setOpenSurveys] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(
        () => {
            setLoading(true);
            getOpenSurveys().then( list =>{
                setOpenSurveys(list);
                setLoading(false);
            });
        }
    ,[]);

    const openSurverysCards = openSurveys.map( (survey) => {
        return (
            <SurveyCard key={survey.id} id={survey.id} title={survey.title} questions={survey.questions}/>
        );
    } );

    return (
        <>
            <Container className="m-3">
                <h3>Published Surveys
                { loading ?
                        <Badge variant="danger">Surveys are loading...</Badge>
                    : null }
                </h3> 
                <Container className="d-flex flex-wrap">
                    {openSurverysCards}
                </Container>
            </Container>
            
        </>
    );
}

function SurveyCard(props) {

    const id = props.id;
    const title = props.title;
    const questions = props.questions;

    return (
        <>
            <Card bg="dark" text="light" className="m-3" style={{ width: '18rem' }}>
                <Card.Body>
                    <Card.Title>{title}</Card.Title>
                    <Card.Text>
                        Question: {questions}
                    </Card.Text>
                    <Link to={{
                        pathname: "/compileSurvey",
                        state: {idSurvey: id}
                    }}>
                        <Button variant="info">Open survey</Button>
                    </Link>
                    
                </Card.Body>
            </Card>
        </>
    );

    
}

export {OpenSurveys};