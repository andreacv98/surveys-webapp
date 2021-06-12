import { useState } from "react";
import { Form, Button, Container, Alert } from "react-bootstrap";

function LoginModule(props) {
    const doLogIn = props.doLogIn;
    const [username, setUsername] = useState('admin@polito.it');
    const [password, setPassword] = useState('password');    
    const [errorMessage, setErrorMessage] = useState('') ;

    const handleSubmit = (event) => {
        event.preventDefault();
        setErrorMessage('');
        const credentials = { username: username, password: password };
        
        // SOME VALIDATION, ADD MORE!!!
        let valid = true;
        if(username === '' || password === '' || password.length < 6)
            valid = false;
        
        if(valid)
        {
          doLogIn(credentials);
        }
        else {
          // show a better error message...
          setErrorMessage('Error(s) in the form, please fix it.')
        }
    };

    return(
        <>
            <Container>
                <Form bg="dark" variant="dark">
                    {errorMessage ? <Alert variant='danger'>{errorMessage}</Alert> : ''}
                    <Form.Group controlId='username'>
                        <Form.Label>email</Form.Label>
                        <Form.Control type='email' value={username} onChange={ev => setUsername(ev.target.value)} />
                    </Form.Group>
                    <Form.Group controlId='password'>
                        <Form.Label>Password</Form.Label>
                        <Form.Control type='password' value={password} onChange={ev => setPassword(ev.target.value)} />
                    </Form.Group>
                    <Button variant="outline-success" onClick={handleSubmit}>Login</Button>
                </Form>
            </Container>
        </>
    );

}

export {LoginModule}