import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import { Container } from 'react-bootstrap';
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import { LoginModule } from './LoginModule.js';
import { OpenSurveys } from './OpenSurveys.js';
import { SurveyCompiler } from './SurveyCompiler.js';
import {TopNavbar} from './TopNavbar.js'

function App() {

  const [loggedIn, setLoggedIn] = useState(false);
  const [admin, setAdmin] = useState();

  const logIn = async (credentials) => {
      let response = await fetch("/api/login", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      let type = response.headers.get("Content-Type");
      if(!type.includes("application/json")) {
          throw new TypeError("Expected JSON, got "+type);
      }
      if(response.ok) {
        const admin = await response.json();
        return admin.name;
      }
      else {
        try {
          const errDetail = await response.json();
          throw errDetail.message;
        }
        catch(err) {
          throw err;
        }
      }
  }

  const logOut = async (credentials) => {
    let response = await fetch("/api/logout", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    let type = response.headers.get("Content-Type");
    if(!type.includes("application/json")) {
      throw new TypeError("Expected JSON, got "+type);
    }
    if(response.ok) {
      return;
    }
    else {
      try {
        const errDetail = await response.json();
        throw errDetail.message;
      }
      catch(err) {
        throw err;
      }
    }
  }
    

  const doLogIn = async (credentials) => {
    try {
      setAdmin(await logIn(credentials));
      setLoggedIn(true);
      //setMessage({msg: `Welcome, ${user}!`, type: 'success'});
    } catch(err) {
      //setMessage({msg: err, type: 'danger'});
    }
  }

  const doLogOut = async (credentials) => {
    try {
      logOut();
      setLoggedIn(false);
      //setMessage({msg: `Welcome, ${user}!`, type: 'success'});
    } catch(err) {
      //setMessage({msg: err, type: 'danger'});
    }
  }

  return (
    <>
    <Container fluid className="p-0" style={{background: "black", height: "100vh", minHeight: "100vh"}}>
    <Router>
      <Switch>
        <Route 
          path="/login"
          render={
            () =>
              <>
              {
                loggedIn ?
                  <Redirect to="/" />
                :
                  <>
                    <TopNavbar loginPage={true}/>
                    <LoginModule doLogIn={doLogIn} />
                  </>                  
              }
                
              </>
          }
        />
        <Route 
          path="/compileSurvey"
          render={
            ({location}) =>
              <>
              {
                location.state ?
                <>
                  <TopNavbar loginPage={false}/>
                  <SurveyCompiler idSurvey={location.state.idSurvey}/>
                </>
                :
                <Redirect to="/" />
              }
              </>
          }
        />
        <Route 
          path="/"
          render={
            () =>
              <>
                <TopNavbar loginPage={false} loggedIn={loggedIn} admin={admin} logout={doLogOut}/>
                <OpenSurveys />
              </>
          }
        />
      </Switch>
    </Router>
    </Container>  
    </>
  );
}

export default App;
