import { useEffect, useState } from "react";
import { Card, Container, Button, Badge, ProgressBar, Alert } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import { getMySurveys } from "./utilities";
import { MySurveysReport } from "./MySurveysReport.js"

function MySurveys(props) {

    const location = useLocation();
    const idSurvey = location.state ? location.state.idSurvey : undefined;

    const [surveys, setSurveys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(
        () => {
            setLoading(true);
            getMySurveys().then( list =>{
                setSurveys(list);
                setLoading(false);
            })
            .catch((err) => {
                console.log(err);
                setErrorMessage(err);
            })
            .finally(() => {
                setLoading(false);
            })            
            ;
        }
    ,[]);

    const surverysCards = surveys.map( (survey, index) => {
        return (
            <SurveyCard key={survey.id} id={survey.id} title={survey.title} users={survey.users} index={index}/>
        );
    } );

    return (
        <>
            <Container fluid className="p-3">
                <h3 className="text-light">My Published Surveys
                {errorMessage ? <Alert variant='danger'>{errorMessage}</Alert> : ''}
                { loading ?
                    <>
                        <Badge variant="danger">Surveys are loading...</Badge>
                        <ProgressBar animated now={100} />
                    </>
                    : null }
                </h3> 
                <Container fluid className="d-flex flex-wrap">

                    {
                        idSurvey ?
                        <MySurveysReport idSurvey={idSurvey}/>
                        :
                        surverysCards
                    }
                </Container>
            </Container>
            
        </>
    );
}

function SurveyCard(props) {

    const id = props.id;
    const title = props.title;
    const users = props.users;
    const index = props.index

    return (
        <>
            <Card text="light" className="m-3" style={{ width: '18rem', background: index%2 === 0 ? "#4d1059" : "#310f38" }}>
                <Card.Body>
                    <Card.Title>{title}</Card.Title>
                    <Card.Text>
                        Compilations: {users}
                    </Card.Text>
                    <Link to={{
                        pathname: "/mySurveys",
                        state: {idSurvey: id}
                    }}>
                        <Button variant="info">Open survey</Button>
                    </Link>
                    
                </Card.Body>
            </Card>
        </>
    );

    
}

export {MySurveys};