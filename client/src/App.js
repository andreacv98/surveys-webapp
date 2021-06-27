import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import { LoginModule } from './LoginModule.js';
import { OpenSurveys } from './OpenSurveys.js';
import { MySurveys } from './MySurveys.js'
import { SurveyCompiler } from './SurveyCompiler.js';
import {TopNavbar} from './TopNavbar.js'
import {SurveyAdder} from './SurveyAdder.js'
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
        let adm = await getUserInfo();
        setAdmin(adm.name);
        setLoggedIn(true);
      } catch(err) {
        setAdmin("");
        setLoggedIn(false);
        //console.error(err.error);
      }
    };
    checkAuth();
  });

  return (
    <>
    <Router>
      <Switch>
      <Route 
          path="/addSurvey"
          render={
            () =>
              <>
              {
                !loggedIn ?
                  <Redirect to="/" />
                :
                <>
                  <TopNavbar loginPage={false} loggedIn={loggedIn} admin={admin} logout={doLogOut}/>
                  <SurveyAdder />  
                </>                        
              }
                
              </>
          }
        />
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
          path="/mySurveys"
          render={
            () =>
              <>
              {
                !loggedIn ?
                  <Redirect to="/" />
                :
                <>
                  <TopNavbar loginPage={false} loggedIn={loggedIn} admin={admin} logout={doLogOut}/>
                  <MySurveys />   
                </>                        
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
