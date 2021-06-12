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
        
        let valid = true;
        if(username === '' || !username.includes("@") || password === '' || password.length < 6)
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
            <Container fluid className="p-5">
                <Form>
                    {errorMessage ? <Alert variant='danger'>{errorMessage}</Alert> : ''}
                    <Form.Group controlId='username'>
                        <Form.Label className="text-light">email</Form.Label>
                        <Form.Control type='email' value={username} onChange={ev => setUsername(ev.target.value)} />
                    </Form.Group>
                    <Form.Group controlId='password'>
                        <Form.Label className="text-light">Password</Form.Label>
                        <Form.Control type='password' value={password} onChange={ev => setPassword(ev.target.value)} />
                    </Form.Group>
                    <Button variant="outline-success" onClick={handleSubmit}>Login</Button>
                </Form>
            </Container>
        </>
    );

}

export {LoginModule}