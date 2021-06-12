import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
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
      const user = await response.json();
      return user.name;
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
    <Router>
      <Switch>
        <Route 
          path="/login"
          render={
            () =>
              <>
                <TopNavbar loginPage={true}/>
              </>
          }
        />
        <Route 
          path="/compileSurvey"
          render={
            ({location}) =>
              <>
              {
                console.log("Location state:")                
              }
              {
                console.log(location.state)
              }
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
                <TopNavbar loginPage={false} loggedIn={loggedIn} user={admin} logout={doLogOut}/>
                <OpenSurveys />
              </>
          }
        />
      </Switch>
    </Router>
      
    </>
  );
}

export default App;
