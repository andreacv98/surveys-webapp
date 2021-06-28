'use strict';

const dao = require('./dao.js')

const express = require('express');
const morgan = require('morgan'); // logging middleware
const passport = require('passport'); // auth middleware
const LocalStrategy = require('passport-local').Strategy; // username and password for login
const session = require('express-session');

const { check, validationResult } = require('express-validator'); // validation middleware

/*** Set up Passport ***/
// set up the "username and password" login strategy
// by setting a function to verify username and password
passport.use(new LocalStrategy(
  function (username, password, done) {
    dao.getAdmin(username, password).then((user) => {
      if (!user)
        return done(null, false, { message: 'Incorrect username and/or password.' });

      return done(null, user);
    })
  }
));

// serialize and de-serialize the user (user object <-> session)
// we serialize the user id and we store it in the session: the session is very small in this way
passport.serializeUser((user, done) => {
  //console.log("serializeUser: user:" + JSON.stringify(user));
  done(null, user.id);
});

// starting from the data in the session, we extract the current (logged-in) user
passport.deserializeUser((id, done) => {
  //console.log("deserializeUser: id:" + id);
  dao.getAdminById(id)
    .then(user => {
      //console.log("deserializeUser: user da db:" + JSON.stringify(user));
      done(null, user); // this will be available in req.user
    }).catch(err => {
      done(err, null);
    });
});

// init express
const app = new express();
const port = 3001;

app.use(morgan('dev'));
app.use(express.json());

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

// custom middleware: check if a given request is coming from an authenticated user
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated())
    return next();

  return res.status(401).json({ error: 'not authenticated' });
}

// set up the session
app.use(session({
  // by default, Passport uses a MemoryStore to keep track of the sessions
  secret: 'a secret sentence not to share with anybody and anywhere, used to sign the session ID cookie',
  resave: false,
  saveUninitialized: false,
}));

// then, init passport
app.use(passport.initialize());
app.use(passport.session());

app.post('/api/login', function (req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);
    if (!user) {
      // display wrong login messages
      return res.status(401).json(info);
    }
    // success, perform the login
    req.login(user, (err) => {
      if (err)
        return next(err);

      // req.user contains the authenticated user, we send all the user info back
      // this is coming from dao.getAdmin()
      return res.json(req.user);
    });
  })(req, res, next);
});

// DELETE /sessions/current 
// logout
app.delete('/api/sessions/current', (req, res) => {
  req.logout();
  res.end();
});

// GET /sessions/current
// check whether the user is logged in or not
app.get('/api/sessions/current', (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json(req.user);
  }
  else
    res.status(401).json({ error: 'Unauthenticated user!' });;
});

app.get('/api/opensurveys', async (req, res) => {
  try {
    const result = await dao.getSurveys();
    //res.set('Content-Type', "application/json");
    if (result.error)
      res.status(400).json(result);
    else
      res.status(200).json(result);
  } catch (err) {
    res.status(500).end();
  }
});

app.get("/api/opensurveys/:id",
  [
    check("id").isNumeric()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation error");
      return res.status(422).json({ errors: errors.array() });
    }
    const id = req.params.id;
    try {
      const surveyInfo = await dao.getSurveyInfo(id);
      let questions = await dao.getQuestionsBySurveyId(id);

      questions.forEach(e => {
        //Check if is a closed questions
        if (e.type === 0) {
          let answers = dao.getAnswersByQuestionId(e.id);
          e.answers = answers;
        }
      });

      await Promise.all(questions.map(async (question, index, array) => {
        if (question.type === 0) {
          let answers = await dao.getAnswersByQuestionId(question.id);
          array[index].answers = answers;
        }
      }));

      let survey = {
        surveyInfo,
        questions
      }
      res.json(survey);
    } catch (err) {
      res.status(500).end();
    }
  }
);

app.get('/api/mysurveys', isLoggedIn, async (req, res) => {
  try {

    const result = [];

    const surveys = await dao.getMySurveys(req.user.id);

    for (const s of surveys) {
      let count = await dao.getMySurveyCount(s.id);
      s.users = count;
      result.push(s);
    }


    //res.set('Content-Type', "application/json");
    if (result.error)
      res.status(400).json(result);
    else
      res.status(200).json(result);
  } catch (err) {
    res.status(500).end();
  }
});

app.get('/api/mysurveys/:id', isLoggedIn,
  [
    check("id").isNumeric().bail().custom(async (value, { req }) => await isMySurvey(value, req.user.id))
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation error");
      return res.status(422).json({ errors: errors.array() });
    }
    const id = req.params.id;
    try {
      const surveyInfo = await dao.getSurveyInfo(id);
      res.json(surveyInfo);
    } catch (err) {
      res.status(500).end();
    }
  });

async function isValidClosedAnswers(closedAnswers, idSurvey) {


  const questions = (await dao.getQuestionsBySurveyId(idSurvey)).filter((q) => {
    // Get only closed questions
    return q.type === 0
  });
  // Check that answers given owns to a question of the survey

  for (const ca of closedAnswers) {
    let validAnswers = true;

    for (const q of questions) {
      const answers = (await dao.getAnswersByQuestionId(q.id)).filter(a => a.id === ca);
      if (answers.length > 0) {
        // Found the answer inside the set of answers of the specific question, so it's valid
        validAnswers = true;
      }
    }

    if (!validAnswers) {
      throw new Error("Answers provided does not own to any question to the provided survey id");
    }
  }



  for (const q of questions) {
    let answersChosen = 0;    // how many answers of this question have been chosen by the user
    const answers = (await dao.getAnswersByQuestionId(q.id));
    answers.forEach(a => {
      if (closedAnswers.indexOf(a.id) !== -1) {
        // Eligible answer is present in the array
        answersChosen++;
      }
    });

    if (answersChosen < q.min || answersChosen > q.max) {
      throw new Error("A question does not have the right amount of answers");
    }
  }
}

async function isValidOpenAnswers(openAnswers, idSurvey) {

  const questions = (await dao.getQuestionsBySurveyId(idSurvey)).filter((q) => {
    // Get only open and comulsory questions
    return (q.type === 1)
  });

  // Check if the question of each open answers owns to the open ones of the survey
  openAnswers.forEach((oa) => {
    if (oa.id === undefined || oa.text === undefined) {
      throw new Error("An open answer does not define all the necessary fields, check the API documentation.");
    }
    if (questions.filter(q => q.id === oa.id).length === 0) {
      // The question id provided is not good
      throw new Error("An open answer question id is not valid based on the survey id provided");
    }
    // Check answer length
    if(oa.text.length > 200) {
      throw new Error("An open answer cannot be longer than 200 characters")
    }
  });

  for (const q of questions) {
    if (q.min >= 1) {
      let exists = openAnswers.filter(a => a.id === q.id).length;
      if (exists === 0) {
        throw new Error("A compulsory question is without any anwer");
      }
    }
  }
}

app.post("/api/opensurveys/:idSurvey/answers",
  [
    check("idSurvey").isNumeric(),
    check("user").isString().notEmpty(),
    check("closedAnswers").isArray().bail().custom(async (value, { req }) => { await isValidClosedAnswers(value, req.params.idSurvey) }),
    check("openAnswers").isArray().bail().custom(async (value, { req }) => { await isValidOpenAnswers(value, req.params.idSurvey) }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation error");
      return res.status(422).json({ errors: errors.array() });
    }

    const user = req.body.user;
    const closedAnswers = req.body.closedAnswers;
    const openAnswers = req.body.openAnswers;

    try {
      const userId = await dao.insertUser(user);

      for (const ca of closedAnswers) {
        await dao.insertUserAnswer(userId, ca);
      }

      for (const oa of openAnswers) {
        let answerId = await dao.insertAnswer(oa.text, oa.id);
        await dao.insertUserAnswer(userId, answerId);
      }

      return res.status(200).json({}).end();

    } catch (err) {
      console.log(err);
      res.status(500).end();
    }

  }
)

async function isMySurvey(idSurvey, adminId) {
  let mySurveys = await dao.getMySurveys(adminId);
  const isMine = mySurveys.filter(s => {
    return s.id == idSurvey
  }).length;
  if (!isMine) {
    throw new Error("Survey required does not belong to the current logged user");
  }
}

app.get("/api/mysurveys/:id/users", isLoggedIn,
  [
    check("id").isNumeric().bail().custom(async (value, { req }) => await isMySurvey(value, req.user.id))
  ],
  async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation error");
      return res.status(422).json({ errors: errors.array() });
    }

    const id = req.params.id;

    try {
      const result = await dao.getUsersSurvey(id)
      if (result.error)
        res.status(400).json(result);
      else
        res.status(200).json(result);
    } catch (err) {
      console.log(err);
      res.status(500).end();
    }
  }
);

app.get("/api/mysurveys/:idSurvey/users/:idUser", isLoggedIn, [
  check("idSurvey").isNumeric().bail().custom(async (value, { req }) => await isMySurvey(value, req.user.id)),
  check("idUser").isNumeric()
],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log("Validation error");
        return res.status(422).json({ errors: errors.array() });
      }

      const idSurvey = req.params.idSurvey;
      const idUser = req.params.idUser;

      const result = await dao.getUserAnswers(idSurvey, idUser);

      if (result.error)
        res.status(400).json(result);
      else
        res.status(200).json(result);

    } catch (err) {
      console.log(err)
      res.status(500).err();
    }
  }
);

function checkQuestions(questions) {
  if (questions.length === 0) {
    throw new Error("Cannot create an empty survey");
  }

  questions.forEach(q => {
    // Question text check
    if (typeof q.text !== 'string') {
      throw new Error("Question text can only be a string");
    }
    if (q.text === "") {
      throw new Error("Question text cannot be empty");
    }

    
    // Question priority check
    if (Number.isNaN(q.priority)) {
      throw new Error("Question priority can only be a number");
    } else if (q.priority < 0) {
      throw new Error("Question priority can only be a positive number");
    }

    // Question min check
    if (Number.isNaN(q.min)) {
      throw new Error("Question min can only be a number");
    } else if (q.min < 0 && q.min > Math.max(q.max, q.answers.length)) {
      throw new Error("Question min can only be an number beetween 1 and maximum answers avaible/choosable(max)");
    }

    // Question max check
    if (Number.isNaN(q.max)) {
      throw new Error("Question max can only be a number");
    } else if (q.max < 1 || q.max > (q.answers.length > 1 ? q.answers.length : 1)) {
      throw new Error("Question max can only be an number beetween 1 and maximum answers avaible");
    }

    // Question type check
    if (Number.isNaN(q.type)) {
      throw new Error("Question type can only be a number");
    } else if (q.type !== 0 && q.type !== 1) {
      throw new Error("Question type can only be an number beetween 0 and 1");
    }

    if (q.type === 0) {
      // Closed question
      // Check available answers
      if (q.answers.length === 0) {
        throw new Error("Closed question needs at least one answer");
      } else if (q.max > q.answers.length) {
        throw new Error("Closed question cannot have a maximum nuber of choosable answers more than those available");
      } else if (q.answers.length > 10){
        throw new Error("Closed question cannot have more than 10 answers available");
      }

      // Check answers inside
      if (!q.answers.every(a => typeof a === 'string')) {
        throw new Error("Answer text can only be a string");
      }
      if (!q.answers.every(a => typeof a !== "")) {
        throw new Error("Answer text cannot be empty");
      }
    }
  }
  );

  return true;
}

app.post("/api/mysurveys/", isLoggedIn, [
  check("title").isString().bail().notEmpty(),
  check("questions").isArray().bail().custom( (value, { req }) => checkQuestions(value) )
],
async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("Validation error");
    console.log(errors);
    return res.status(422).json({ errors: errors.array() });
  }

  const userid = req.user.id;
  const questions = req.body.questions;
  const surveyTitle = req.body.title;

  try {
    const surveyId = await dao.insertSurvey(surveyTitle, userid);

    let answerPromises = []
    for (const q of questions) {
      let questionId = await dao.insertQuestion(q.text, q.priority, q.type, q.min, q.max, surveyId);
      if(q.type === 0) {
        for(const a of q.answers) {
          answerPromises.push(dao.insertAnswer(a, questionId));
        }
        await Promise.all(answerPromises);
      }      
    }

    return res.status(200).json();

  } catch (err) {
    console.log(err);
    res.status(500).end();
  }

}
);