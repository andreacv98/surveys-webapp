import { useEffect, useState } from "react";
import { Redirect } from 'react-router-dom';
import { Alert, Badge, Button, Container, Form, ProgressBar, Col } from "react-bootstrap";
import { ArrowDownCircle, ArrowUpCircle, Trash } from "react-bootstrap-icons"
import { createSurvey } from "./utilities";

function SurveyAdder(props) {

    const [surveyInfo, setSurveyInfo] = useState("");
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);

    const [send, setSend] = useState(false);
    const [sent, setSent] = useState(false);

    const [errorMessages, setErrorMessages] = useState([]);

    const [qIdAct, setQIdAct] = useState(0);

    useEffect(() => {
        const formatData = () => {
            let survey = {
                "title": surveyInfo,
                "questions": []
            };

            questions.forEach(q => {
                let question = {
                    "text": q.data.text,
                    "priority": q.data.priority,
                    "min": q.data.min,
                    "max": q.data.max,
                    "type": q.data.type,
                    "answers": []
                };

                q.data.answers.forEach(a => {
                    question.answers.push(a.text);
                })

                survey.questions.push(question);
            });

            return survey;
        }

        if (send) {
            createSurvey(formatData())
                .then(response => {
                    setLoading(true)
                    setSent(true);
                })
                .catch(err => {
                    let errMsgs = [];
                    console.log(err);
                    errMsgs.push(err);
                    setErrorMessages(errMsgs);
                })
                .finally(() => {
                    if (!sent) {
                        setLoading(false)
                    }
                })
        }


    }, [send, sent, surveyInfo, questions])

    function checkFormValidity() {
        let valid = true;

        // Clear error messages
        let errMsgs = [];

        // Check survey info
        if (surveyInfo === "") {
            valid = false;
            errMsgs.push("Survey title cannot be empty!");
        }

        if (questions.length === 0) {
            valid = false;
            errMsgs.push("Survey is without any question, add at least one");
        }

        // Check
        questions.forEach((q) => {
            // Question text check

            if (q.data.text === "") {
                valid = false;
                errMsgs.push("Question #" + q.data.priority + " has an empty title, please fill or delete it");
            }

            // Compulsory questions
            if (q.data.type === 0) {
                if (q.data.answers.length === 0) {
                    valid = false;
                    errMsgs.push("Question #" + q.data.priority + " '" + q.data.text + " is a closed question without any answer, please add at least one!");
                } else {
                    if (!q.data.answers.every(a => a.text !== "")) {
                        valid = false;
                        errMsgs.push("Question #" + q.data.priority + " '" + q.data.text + " is a closed question with an empty text answer, fill or delete it");
                    }
                }

            }
        });

        setErrorMessages(errMsgs);

        return valid;
    }



    function handleSubmit(event) {
        event.preventDefault();
        if (checkFormValidity()) {
            setSend(true)
        }
    }

    function handleSurveyText(event) {
        let text = event.target.value;
        setSurveyInfo(text);
    }


    function getQuestionLastPriority() {
        let p = 1;
        if (questions.length > 0) {
            if (questions.length === 1) {
                p = questions[0].data.priority + 1;
            } else {
                let newQuestions = questions.sort((q1, q2) => {
                    return q2.data.priority - q1.data.priority
                })
                p = newQuestions[0].data.priority + 1;
            }
        }
        return p;
    }

    function getQuestionId() {
        let id = qIdAct;
        setQIdAct(qIdAct + 1);
        return id;
    }

    function handleAddQuestion(event) {
        let newQuestions = questions;

        let p = getQuestionLastPriority();
        let id = getQuestionId();

        let question = {
            "id": id,
            "data": {
                "text": "",
                "priority": p,
                "min": 0,
                "max": 1,
                "type": 1,
                "answers": []
            }
        }

        newQuestions.push(question);

        setQuestions([...newQuestions]);
    }

    function handleDeleteQuestion(event) {
        let pos = parseInt(event.target.id, 10);
        let oldPriority = questions[questions.findIndex(q => q.id === pos)].data.priority;
        let newQuestions = questions
            .filter(q => {
                return q.id !== pos
            })
            .map(q => {
                if (q.data.priority > oldPriority) {
                    q.data.priority--;
                }
                return q;
            })
            ;
        setQuestions([...newQuestions]);
    }

    function handleModifyQuestion(question) {
        let index = questions.findIndex(q => {
            return q.id === question.id
        });
        let newQuestions = questions;

        if (newQuestions[index].data.priority !== question.data.priority) {
            // Priority has changed
            let indexPr = newQuestions.findIndex(q => q.data.priority === question.data.priority)
            if (indexPr !== -1) {
                // Let's invert their priority
                newQuestions[indexPr].data.priority = newQuestions[index].data.priority
            }
        }

        newQuestions[index] = question;

        setQuestions([...newQuestions]);
    }

    const questionsRender =
        [...questions]
            .sort((q1, q2) => {
                return q1.data.priority - q2.data.priority
            })
            .map((q, index) => {
                return (
                        <QuestionBox key={index} question={q} handleDeleteQuestion={handleDeleteQuestion} handleModifyQuestion={handleModifyQuestion} index={index} />
                );
            });

    const errorMessagesAlerts = errorMessages.map(
        (errorMessage, index) => {
            return (
                <Alert key={index} variant="danger">
                    {errorMessage}
                </Alert>
            )
        }
    )

    return (
        <>
            {
                sent ?
                    <Redirect to="/mySurveys" />
                    :
                    <>
                        <Container fluid className="p-5">
                            {loading ?
                                <>
                                    <Badge variant="danger">Survey is being added...</Badge>
                                    <ProgressBar animated now={100} />
                                </>
                                :
                                <>
                                    <h2 className="text-light">Add survey</h2>

                                    {errorMessagesAlerts}

                                    <Form onSubmit={handleSubmit}>
                                        <Form.Group>
                                            <Form.Control size="lg" type="text" placeholder="Survey title" value={surveyInfo} onChange={handleSurveyText} />
                                        </Form.Group>
                                        <Form.Group>
                                            {questionsRender}
                                            <Button variant="primary" className="btn-block btn-lg" onClick={handleAddQuestion}>
                                                Add Questions
                                            </Button>
                                        </Form.Group>
                                        <Button variant="primary" type="submit" className="btn-block btn-lg" onClick={handleSubmit}>
                                            Publish
                                        </Button>
                                    </Form>
                                </>

                            }

                        </Container>
                    </>
            }

        </>
    );
}

function QuestionBox(props) {

    const question = props.question;
    const handleDeleteQuestion = props.handleDeleteQuestion;
    const handleModifyQuestion = props.handleModifyQuestion;

    const index = props.index;

    function getQuestion() {
        let newQuestion = {
            "id": question.id,
            "data": {
                "text": question.data.text,
                "priority": question.data.priority,
                "min": question.data.min,
                "max": question.data.max,
                "type": question.data.type,
                "answers": question.data.answers
            }
        };

        return newQuestion;
    }


    function handleTypeSelect(event) {
        let newQuestion = getQuestion();
        newQuestion.data.type = parseInt(event.target.value, 10);
        if (newQuestion.data.type === 1) {
            newQuestion.data.answers = [];
            newQuestion.data.max = 1;
            newQuestion.data.min = newQuestion.data.min > 0 ? 1 : 0;
        }
        handleModifyQuestion(newQuestion);
    }

    function handlePriority(priority) {
        let newQuestion = getQuestion();
        newQuestion.data.priority = priority;
        handleModifyQuestion(newQuestion);
    }

    function handleQuestionText(event) {
        let newQuestion = getQuestion();
        newQuestion.data.text = event.target.value;
        handleModifyQuestion(newQuestion);
    }

    function handleOptionalCheck(event) {
        let newQuestion = getQuestion();
        newQuestion.data.min = (event.target.checked ? 0 : 1);
        handleModifyQuestion(newQuestion);
    }

    function handleMaxText(event) {
        let newQuestion = getQuestion();
        newQuestion.data.max = parseInt(event.target.value, 10);
        if (newQuestion.data.min > newQuestion.data.max) {
            newQuestion.data.min = newQuestion.data.max;
        }
        handleModifyQuestion(newQuestion);
    }

    function handleMinText(event) {
        let newQuestion = getQuestion();
        newQuestion.data.min = parseInt(event.currentTarget.value, 10);
        handleModifyQuestion(newQuestion);
    }

    function handleModifyAnswers(answers) {
        let newQuestion = getQuestion();
        newQuestion.data.answers = answers;
        handleModifyQuestion(newQuestion);
    }

    const answerBox =
        question.data.type === 0 ?
            <>
                <Form.Group>
                    <AnswersBox answers={question.data.answers} handleModifyAnswers={handleModifyAnswers} />
                </Form.Group>


            </>
            :
            null
        ;
    const minBox = question.data.type === 0 ?
        <>
            <Form.Group>
                <Form.Label className="text-light">Minimum answers</Form.Label>
                <Form.Control type="number" value={question.data.min} onChange={handleMinText} min={0} max={question.data.answers.length === 0 ? 1 : question.data.max} />
            </Form.Group>
        </>
        :
        <Form.Check
            type="checkbox"
            className="text-light"
            onChange={handleOptionalCheck}
            checked={question.data.min === 0}
            label="Optional"
        />
        ;

    return (
        <>
            <Form.Group className="p-3" style={{ background: index % 2 === 0 ? "#4d1059" : "#310f38" }} >
                <Form.Row>
                    <Col lg={11} xs="auto">
                        <Form.Row>
                            <Col lg={9} xs="auto">
                                <Form.Group>
                                    <Form.Label className="text-light">#{question.data.priority} Question text:</Form.Label>
                                    <Form.Control type="textarea" placeholder="Question text" value={question.data.text} onChange={handleQuestionText} />
                                </Form.Group>

                                {answerBox}
                            </Col>
                            <Col lg={3} xs="auto">
                                <Form.Group>
                                    <Form.Label className="text-light">Type</Form.Label>
                                    <Form.Control as="select" value={question.data.type} onChange={handleTypeSelect}>
                                        <option value="0" >Closed</option>
                                        <option value="1">Open</option>
                                    </Form.Control>
                                </Form.Group>
                                <Form.Group>
                                    {minBox}
                                </Form.Group>
                                {
                                    question.data.type === 0 ?
                                        <>
                                            <Form.Group>
                                                <Form.Label className="text-light">Maximum answers</Form.Label>
                                                <Form.Control type="number" value={question.data.max} onChange={handleMaxText} min={1} max={question.data.answers.length === 0 ? 1 : question.data.answers.length} />
                                            </Form.Group>
                                        </>
                                        :
                                        null
                                }

                            </Col>
                        </Form.Row>

                        <Form.Row>
                            <Button variant="danger" id={question.id} className="btn-block btn-lg" onClick={handleDeleteQuestion}>
                                Delete
                            </Button>
                        </Form.Row>
                    </Col>
                    <Col lg={1} xs="auto">
                        <Button variant="primary" className="btn-block" onClick={() => { handlePriority(question.data.priority - 1) }}>
                            <ArrowUpCircle />
                        </Button>
                        <Button variant="primary" className="btn-block" onClick={() => { handlePriority(question.data.priority + 1) }}>
                            <ArrowDownCircle />
                        </Button>
                    </Col>
                </Form.Row>
            </Form.Group>

        </>
    );
}

function AnswersBox(props) {
    const answers = props.answers;
    const handleModifyAnswers = props.handleModifyAnswers;

    const [aIdAct, setAIdAct] = useState(0);

    function getAnswerId() {
        let id = aIdAct;
        setAIdAct(aIdAct + 1);
        return id;
    }

    function handleModifyAnswer(newAnswer) {
        let newAnswers = answers;
        let index = newAnswers.findIndex(a => a.id === newAnswer.id);
        if (index !== -1) {
            // Answer exists
            newAnswers[index].text = newAnswer.text;
        } else {
            newAnswers.push(
                {
                    "id": newAnswer.id,
                    "text": newAnswer.text
                }
            );
        }

        handleModifyAnswers(newAnswers);
    }

    function handleAnswerText(event) {
        let value = event.target.value;
        let idAnswer = parseInt(event.target.id, 10);
        let newAnswer = {
            "id": idAnswer,
            "text": value
        }
        handleModifyAnswer(newAnswer);
    }

    function handleAnswerAdd() {
        let id = getAnswerId();
        let answer = {
            "id": id,
            "text": ""
        }
        if (answers.length < 10) {
            // Add only if less than 10 answers already exist
            handleModifyAnswer(answer);
        }

    }

    function handleAnswerDelete(event) {
        let pos = parseInt(event.target.id, 10);
        let newAnswers = answers.filter(a => {
            return a.id !== pos
        });
        handleModifyAnswers(newAnswers);
    }

    const answersRender = answers.map(
        (a, index) => {
            return (
                <div key={index}>
                    <Form.Group controlId={a.id} >
                        <Form.Row >
                            <Col lg={11} xs="auto">
                                <Form.Control type="text" placeholder="Answer text" value={a.text} onChange={handleAnswerText} maxLength="200" />
                            </Col>
                            <Col lg={1} xs="auto">
                                <Button variant="danger" className="btn-block" onClick={handleAnswerDelete}>
                                    <Trash />
                                </Button>
                            </Col>
                        </Form.Row>
                    </Form.Group>

                </div>
            );
        }
    )

    return (
        <>
            <Form.Group>
                {answersRender}
                <Button variant="primary" className="btn-block btn-lg" onClick={handleAnswerAdd}>
                    Add Answer
                </Button>
            </Form.Group>
        </>
    );
}

export { SurveyAdder }