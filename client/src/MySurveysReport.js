import { useEffect, useState } from "react";
import { Alert, Badge, Button, Container, Form, ProgressBar } from "react-bootstrap";
import { getMySurvey, getUserAnswers, getUsersToSurvey } from "./utilities";


function MySurveysReport(props) {
    const idSurvey = props.idSurvey;
    const [idUser, setIdUser] = useState(-1);

    const [surveyInfo, setSurveyInfo] = useState({});
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);

    const [errorMessages, setErrorMessages] = useState([]);

    function handleSelection(event) {
        if (event.target.value === "") {
            setIdUser(-1);
        } else {
            setIdUser(event.target.value);
        }
    }

    useEffect(
        () => {
            setLoading(true);
            getMySurvey(idSurvey)
                .then(
                    (survey) => {
                        setErrorMessages([]);
                        setSurveyInfo(survey);
                        setLoading(false);
                    }
                ).catch(
                    (err) => {
                        let newErrMsgs = errorMessages;
                        newErrMsgs.push(err);
                        setErrorMessages([...newErrMsgs]);
                    })
                ;
            setLoading(true);
            getUsersToSurvey(idSurvey)
                .then(
                    (usersArray) => {
                        setErrorMessages([]);
                        setUsers(usersArray);
                        setLoading(false);
                    })
                .catch(
                    (err) => {
                        let newErrMsgs = errorMessages;
                        newErrMsgs.push(err);
                        setErrorMessages([...newErrMsgs]);
                    });
        }
        , [idSurvey]);

    useEffect(
        () => {
            setLoading(true);
            getUserAnswers(idSurvey, idUser)
                .then(
                    (qas) => {
                        setErrorMessages([]);
                        setQuestions(qas.sort(function (a, b) {
                            return a.priority - b.priority
                        }));
                        setLoading(false);
                    })
                .catch(
                    (err) => {
                        let newErrMsgs = errorMessages;
                        newErrMsgs.push(err);
                        setErrorMessages([...newErrMsgs]);
                    });
        }
        , [idUser, idSurvey])


    const errorMessagesAlerts = errorMessages.map(
        (errorMessage, index) => {
            return (
                <Alert key={index} variant="danger">
                    {errorMessage}
                </Alert>
            )
        }
    )

    const questionsRender = questions.map(
        (question, index) => {
            return (
                <QuestionForm key={question.id} question={question} index={index} />
            );
        }
    )

    return (
        <>
            <Container fluid className="p-5">
                {loading ?
                    <>
                        <Badge variant="danger">Survey is loading...</Badge>
                        <ProgressBar animated now={100} />
                    </>
                    :
                    <>
                        <h2 className="text-light">{surveyInfo.title}</h2>
                        <h4 className="text-muted">by <i>{surveyInfo.author}</i></h4>

                        {errorMessagesAlerts}

                        <UserSelector users={users} handleSelection={handleSelection} idUser={idUser}/>

                        <Form>
                            {questionsRender}
                        </Form>
                    </>

                }

            </Container>

        </>
    );
}

function UserSelector(props) {
    const users = props.users;
    const handleSelection = props.handleSelection;
    const idUser = props.idUser;

    const options = users.map(
        (user) => {

            return <option value={user.id}>{user.name}</option>
        }
    )

    return (
        <>
            <Form.Group controlId="userSelector">
                <Form.Label>User: </Form.Label>
                <Form.Control as="select" onChange={handleSelection} value={idUser}>
                    <option value=""></option>
                    {options}
                </Form.Control>
            </Form.Group>
        </>
    );
}

function QuestionForm(props) {
    const question = props.question
    const index = props.index;

    let answerBox = question.answers.map(
        (a) => {
            return (
                <>
                    <Form.Control type="text" placeholder={a} readOnly />
                </>
            );
        }
    )

    return (
        <>
            <Form.Group key={question.id} className="m-3 p-3" style={{ background: index % 2 === 0 ? "#4d1059" : "#310f38" }} controlId={question.id}>
                <Form.Label className="text-light">{index + 1}. {question.text} </Form.Label>
                {answerBox}
            </Form.Group>
        </>
    );
}

export { MySurveysReport }