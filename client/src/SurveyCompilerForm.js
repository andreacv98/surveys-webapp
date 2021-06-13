import { useEffect, useState } from "react";
import { Badge, Button, Container, Form, ProgressBar } from "react-bootstrap";
import { getSurvey } from "./utilities";


function SurveyCompilerForm(props) {
    const idSurvey = props.idSurvey;

    const [surveyInfo, setSurveyInfo] = useState({});
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);

    function handleSubmit(event) {
        event.preventDefault();
    }

    useEffect(
        () => {
            setLoading(true);
            getSurvey(idSurvey).then(
                (survey) => {
                    setSurveyInfo(survey.surveyInfo);
                    setQuestions(survey.questions);
                    setLoading(false);
                }
            );
        }
    ,[idSurvey]);

    questions.sort(function (a, b) {
        return a.priority - b.priority
    })

    const questionsRender = questions.map(
        (question, index) => {
            return (
                <Form.Group key={question.id} className="m-3 p-3" style={{background: index%2 === 0 ? "#4d1059" : "#310f38"}} controlId={question.id}>
                    <h5 className="text-light">{question.text}</h5>
                    {
                        question.type === 1 ?
                            <Form.Control type="textarea" rows={3}/>
                        :
                            question.max > 1 ?
                                question.answers.map(
                                    (answer) => {
                                        return <Form.Check key={answer.id} className="text-light" type="checkbox" label={answer.text} />
                                    }
                                )
                            :
                                question.answers.map(
                                    (answer) => {
                                        return <Form.Check key={answer.id} className="text-light" type="radio" label={answer.text} />
                                    }
                                )
                    }
                </Form.Group>
            );
        }
    )

    return (
        <>
            <Container fluid className="p-5">
                { loading ?
                    <>
                        <Badge variant="danger">Survey is loading...</Badge>
                        <ProgressBar animated now={100} />
                    </>
                :
                <>
                    <h2 className="text-light">{surveyInfo.title}</h2>
                    <h4 className="text-muted">by <i>{surveyInfo.author}</i></h4>


                    <Form>
                        {questionsRender}
                        <Button variant="primary" type="submit" className="btn-block btn-lg" onClick={handleSubmit}>
                            Submit
                        </Button>   
                    </Form>
                </>
                
                 }
                
            </Container>
            
        </>
    );
}

export {SurveyCompilerForm}