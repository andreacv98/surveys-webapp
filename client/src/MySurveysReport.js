import { useEffect, useState } from "react";
import { Alert, Badge, Container, Form, ProgressBar, Button, Col } from "react-bootstrap";
import { ArrowLeftCircle, ArrowRightCircle } from "react-bootstrap-icons";
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
        if (event.currentTarget.value === "") {
            setIdUser(-1);
        } else {
            setIdUser(event.currentTarget.value);
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

                        <Form>
                            <UserSelector users={users} handleSelection={handleSelection} idUser={idUser} />
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
        (user, index) => {

            return <option key={index} value={user.id}>{user.name}</option>
        }
    )

    const userIndex = users.findIndex(u => u.id === parseInt(idUser, 10));

    const previousButton = (
        userIndex > 0 ?
            <Button value={users[userIndex - 1].id} onClick={handleSelection}>
                <ArrowLeftCircle />
            </Button>
            :
            null
    );

    const followingButton = (
        (userIndex < users.length - 1 && userIndex >= 0) ?
            <Button value={users[userIndex + 1].id} onClick={handleSelection}>
                <ArrowRightCircle />
            </Button>
            :
            null
    );

    return (
        <>
            <Form.Row>
                <Form.Label className="text-light">Select user: </Form.Label>
            </Form.Row>
            <Form.Row>
                <Col className="d-flex justify-content-center" lg={1} xs="auto">
                    {previousButton}
                </Col>
                <Col className="d-flex justify-content-center" lg={10} xs="auto">
                    <Form.Group controlId="userSelector">
                        <Form.Control as="select" onChange={handleSelection} value={idUser} label="User: ">
                            <option value=""></option>
                            {options}
                        </Form.Control>

                    </Form.Group>
                </Col>
                <Col className="d-flex justify-content-center" lg={1} xs="auto">
                    {followingButton}
                </Col>
            </Form.Row>

        </>
    );
}

function QuestionForm(props) {
    const question = props.question
    const index = props.index;

    let answerBox = question.answers.map(
        (a, index) => {
            return (
                <>
                    <Form.Control key={index} type="text" placeholder={a} readOnly className="m-1" />
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