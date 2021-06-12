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
            <Container className="d-flex flex-wrap">
                { loading ?
                    <Badge variant="danger">Surveys are loading...</Badge>
                : null }
                {openSurverysCards}
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
            <Card className="m-3" style={{ width: '18rem' }}>
                <Card.Body>
                    <Card.Title>{title}</Card.Title>
                    <Card.Text>
                        Question: {questions}
                    </Card.Text>
                    <Link to={{
                        pathname: "/compileSurvey",
                        state: {idSurvey: id}
                    }}>
                        <Button variant="primary">Open survey</Button>
                    </Link>
                    
                </Card.Body>
            </Card>
        </>
    );

    
}

export {OpenSurveys};