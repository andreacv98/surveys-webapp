import { useEffect, useState } from "react";
import { Alert, Badge, Button, Container, Form, ProgressBar } from "react-bootstrap";
import { getSurvey } from "./utilities";


function SurveyCompilerForm(props) {
    const submitSurvey = props.submitSurvey;
    const idSurvey = props.idSurvey;

    const [surveyInfo, setSurveyInfo] = useState({});
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);

    const [answersGiven, setAnswersGiven] = useState([]);
    const [textAnswers, setTextAnswers] = useState([]);

    const [errorMessages, setErrorMessages] = useState([]);

    function handleChecked(ev, answer, question) {
        let newAnswers = [...answersGiven];
        console.log(ev.target.checked);
        /*console.log("New Answers: ");
        console.log(newAnswers)*/
        if (ev.target.checked && newAnswers.filter((el) => el === answer.id).length === 0) {
            newAnswers.push(answer.id);
        } else if (!ev.target.checked && newAnswers.filter((el) => el === answer.id).length !== 0) {
            newAnswers = newAnswers.filter((el) => el !== answer.id);
        }

        // Workaround for not triggered uncheked event of radio button
        if(question.type === 0 && question.max === 1) {
            // Delete other selected answers
            let answersIdToDelete = question.answers.filter(a => a.id !== answer.id).map(a => a.id)
            newAnswers = newAnswers.filter((el) => !answersIdToDelete.includes(el));
        }

        /*console.log("Before End handleCheck newAnswers");
        console.log(newAnswers);*/
        setAnswersGiven([...newAnswers]);
        /*console.log("End handleCheck");
        console.log(answersGiven);*/
    }

    function handleText(ev, questionId) {
        let newTextAnswers = [...textAnswers];     

        let exists = newTextAnswers.filter(a => a.id === questionId).length;

        if(exists !== 0) {
            //Delete old text answer
            newTextAnswers = newTextAnswers.filter(a => a.id !== questionId);            
        }

        if(ev.target.value !== "") {
            // Add new text answer if not empty
            let textAnswer = {
                id: questionId,
                text: ev.target.value
            };
            newTextAnswers.push(textAnswer);
        }

        setTextAnswers([...newTextAnswers]);
        //console.log(textAnswers);
    }

    function checkFormValidity() {
        let valid = true;

        // Clear error messages
        let errMsgs = [];

        // Check
        questions.forEach((q) => {
            // Compulsory questions
            if(q.type === 1 && q.min >= 1) {
                // Open question
                // Check if there's response
                let exists = textAnswers.filter(a => a.id === q.id).length;
                if(exists === 0) {
                    valid = false;
                    errMsgs.push("Question '"+q.text+"' has empty response. It is compulsory!");
                }

            } else if(q.type === 0){
                // Closed question
                let answers = 0;    // how many answers of this question have been chosen by the user
                q.answers.forEach(a => {
                    if(answersGiven.indexOf(a.id) !== -1) {
                        // Eligible answer is present in the array
                        answers++;
                    }
                });

                if(answers < q.min || answers > q.max) {
                    if(answers < q.min) {
                        errMsgs.push("Question '"+q.text+"' has empty choice. It is compulsory!");
                    } else if(answers > q.max) {
                        errMsgs.push("Question '"+q.text+"' has too many answers selected. You must choose no more than "+q.max+" answers!");
                    }
                    valid = false;
                }
            }
        });

        setErrorMessages(errMsgs);

        return valid;
    }

    function handleSubmit(event) {
        event.preventDefault();
        if(checkFormValidity()) {
            submitSurvey(answersGiven, textAnswers);
        }        
    }

    useEffect(
        () => {
            setLoading(true);
            getSurvey(idSurvey).then(
                (survey) => {
                    setSurveyInfo(survey.surveyInfo);
                    setQuestions(survey.questions.sort(function (a, b) {
                        return a.priority - b.priority
                    }));
                    setLoading(false);
                }
            );
        }
        , [idSurvey]);

    const errorMessagesAlerts = errorMessages.map(
        (errorMessage, index) => {
            return(
                <Alert key={index} variant="danger">
                    {errorMessage}
                </Alert>
            )
        }
    )

    const questionsRender = questions.map(
        (question, index) => {
            return (
                <QuestionForm key={question.id} question={question} index={index} answersGiven={answersGiven} textAnswers={textAnswers} handleChecked={handleChecked} handleText={handleText}/>
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

                        <Form onSubmit={handleSubmit}>
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

function QuestionForm(props) {
    const question = props.question
    const answersGiven = props.answersGiven;
    const textAnswers = props.textAnswers;
    const index = props.index;
    const handleChecked = props.handleChecked;
    const handleText = props.handleText;

    let answerBox = <></>


    if (question.type === 1) {
        // Open question
        if (question.min >= 1) {
            
            answerBox = <Form.Control
                        as="textarea"
                        rows={3}
                        required
                        onChange={(ev) => handleText(ev, question.id)}
                        value={
                            textAnswers.filter(el => el.id === question.id).length > 0 ?
                                textAnswers.filter(el => el.id === question.id)[0].text
                            :
                                ""
                        }
                        />
        } else {
            answerBox = <Form.Control
                        as="textarea"
                        rows={3}
                        onChange={(ev) => handleText(ev, question.id)}
                        value={
                            textAnswers.filter(el => el.id === question.id).length > 0 ?
                                textAnswers.filter(el => el.id === question.id)[0].text
                            :
                                ""
                        } />
        }
    } else {
        // Closed question
        let typeCheck;
        if (question.max > 1) {
            typeCheck = "checkbox";
        } else {
            typeCheck = "radio";
        }

        answerBox = question.answers.map((answer) => {
            return <CheckBox
                key={answer.id}
                answersGiven={answersGiven}
                type={typeCheck}
                question={question}
                answer={answer}
                handleChecked={handleChecked}
            />
        });
    }

    return (
        <>
            <Form.Group key={question.id} className="m-3 p-3" style={{ background: index % 2 === 0 ? "#4d1059" : "#310f38" }} controlId={question.id}>
                <Form.Label className="text-light">{index + 1}. {question.text} {question.min === 1 ? <Badge variant="danger">Compulsory</Badge> : null} {question.max > 1 ? <Badge variant="warning">No more than {question.max}</Badge> : null}</Form.Label>
                {answerBox}
            </Form.Group>
        </>
    );
}

function CheckBox(props) {
    const answersGiven = props.answersGiven;
    const question = props.question;
    const answer = props.answer;
    const type = props.type;

    const handleChecked = props.handleChecked;

    return (
        <>
            <Form.Check
                key={answer.id}
                className="text-light"
                type={type}
                checked={answersGiven.filter((el) => el === answer.id).length > 0}
                onChange={ev => handleChecked(ev, answer, question)}
                label={answer.text}
                name={question.id}
                id={answer.id} />
        </>
    );
}

export { SurveyCompilerForm }