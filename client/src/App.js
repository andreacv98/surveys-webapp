import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import { LoginModule } from './LoginModule.js';
import { OpenSurveys } from './OpenSurveys.js';
import { SurveyCompiler } from './SurveyCompiler.js';
import {TopNavbar} from './TopNavbar.js'
import { getUserInfo, logIn, logOut } from './utilities.js';

function App() {

  const [loggedIn, setLoggedIn] = useState(false);
  const [admin, setAdmin] = useState();
    

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

  useEffect(() => {
    const checkAuth = async() => {
      try {
        // here you have the user info, if already logged in
        // TODO: store them somewhere and use them, if needed
        await getUserInfo();
        setLoggedIn(true);
      } catch(err) {
        console.error(err.error);
      }
    };
    checkAuth();
  });

  return (
    <>
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
                  <TopNavbar loginPage={false}  loggedIn={loggedIn} admin={admin} logout={doLogOut}/>
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
    </>
  );
}

export default App;
