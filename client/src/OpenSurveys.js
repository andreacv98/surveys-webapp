import { useEffect, useState } from "react";
import { Card, Container, Button, Badge, ProgressBar } from "react-bootstrap";
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

    const openSurverysCards = openSurveys.map( (survey, index) => {
        return (
            <SurveyCard key={survey.id} id={survey.id} title={survey.title} questions={survey.questions} index={index}/>
        );
    } );

    return (
        <>
            <Container className="m-3">
                <h3 className="text-light">Published Surveys
                { loading ?
                    <>
                        <Badge variant="danger">Surveys are loading...</Badge>
                        <ProgressBar animated now={100} />
                    </>
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
    const index = props.index

    return (
        <>
            <Card text="light" className="m-3" style={{ width: '18rem', background: index%2 === 0 ? "#4d1059" : "#310f38" }}>
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