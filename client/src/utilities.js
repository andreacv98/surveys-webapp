async function getOpenSurveys() {
  let url = "/api/opensurveys";

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    let type = response.headers.get("Content-Type");
    if (!type.includes("application/json")) {
      throw new TypeError("Expected JSON, got " + type);
    }
    const surveys = await response.json();
    return surveys;
  } catch (e) {
    console.log(e);
  }
}

async function getMySurveys() {
  let url = "/api/mysurveys";


  let result = {};

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    let type = response.headers.get("Content-Type");
    if (!type.includes("application/json")) {
      throw new TypeError("Expected JSON, got " + type);
    }


    if (response.ok) {
      result = await response.json();
    } else {
      try {
        const errDetail = await response.json();
        throw errDetail.message;
      }
      catch (err) {
        console.log(err);
        throw err;
      }
    }
  } catch (e) {
    console.log(e);
    throw e;
  }
  return result;

}

async function getSurvey(id) {
  let url = "/api/opensurveys/" + id;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    let type = response.headers.get("Content-Type");
    if (!type.includes("application/json")) {
      throw new TypeError("Expected JSON, got " + type);
    }
    const surveys = await response.json();
    return surveys;
  } catch (e) {
    console.log(e);
  }
}

async function getMySurvey(id) {
  let url = "/api/mysurveys/" + id;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    let type = response.headers.get("Content-Type");
    if (!type.includes("application/json")) {
      throw new TypeError("Expected JSON, got " + type);
    }
    const survey = await response.json();
    return survey;
  } catch (e) {
    console.log(e);
  }
}

async function answerSurvey(insertedData) {
  let url = "/api/opensurveys/" + insertedData.idSurvey + "/answers";

  delete insertedData.idSurvey;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(insertedData)
    });

    let type = response.headers.get("Content-Type");
    if (!type.includes("application/json")) {
      throw new TypeError("Expected JSON, got " + type);
    }
    let result = {};
    if (response.ok) {
      result = await response.json();
    }
    else {
      try {
        const errDetail = await response.json();
        throw errDetail.message;
      }
      catch (err) {
        throw err;
      }
    }
    return result;
  } catch (e) {
    console.log(e);
  }
}

async function getUsersToSurvey(surveyId) {
  let url = "/api/mysurveys/"+surveyId+"/users";

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
    });

    let type = response.headers.get("Content-Type");
    if (!type.includes("application/json")) {
      throw new TypeError("Expected JSON, got " + type);
    }
    let result = {};
    if (response.ok) {
      const users = await response.json();
      result = users;
    }
    else {
      try {
        const errDetail = await response.json();
        throw errDetail.message;
      }
      catch (err) {
        throw err;
      }
    }
    return result;
  } catch (e) {
    console.log(e);
  }
}

async function getUserAnswers(surveyId, userId) {
  let url = "/api/mysurveys/"+surveyId+"/users/"+userId;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
    });

    let type = response.headers.get("Content-Type");
    if (!type.includes("application/json")) {
      throw new TypeError("Expected JSON, got " + type);
    }
    let result = [];
    if (response.ok) {
      const tmpResult = await response.json();
      tmpResult.forEach((a) => {
        let index = result.findIndex((el) => el.id === a.qId);
        if( index === -1) {
          // Element not found inside formatted result
          let answers = []
          answers.push(a.aText);
          let obj = {
            "id": a.qId,
            "text": a.qText,
            "priority": a.qPriority,
            "answers": answers
          }
          result.push(obj)
        } else {
          // Element was found
          result[index].answers.push(a.aText)
        }
      });
    }
    else {
      try {
        const errDetail = await response.json();
        throw errDetail.message;
      }
      catch (err) {
        throw err;
      }
    }
    return result;
  } catch (e) {
    console.log(e);
  }
}

async function logOut() {
  await fetch('/api/sessions/current', { method: 'DELETE' });
}

async function getUserInfo() {
  const response = await fetch('/api/sessions/current');
  const userInfo = await response.json();
  if (response.ok) {
    return userInfo;
  } else {
    throw userInfo;  // an object with the error coming from the server
  }
}

async function logIn (credentials) {
  let response = await fetch("/api/login", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  let type = response.headers.get("Content-Type");
  if (!type.includes("application/json")) {
    throw new TypeError("Expected JSON, got " + type);
  }
  if (response.ok) {
    const admin = await response.json();
    return admin.name;
  }
  else {
    try {
      const errDetail = await response.json();
      throw errDetail.message;
    }
    catch (err) {
      throw err;
    }
  }
}


export { getOpenSurveys, getSurvey, logOut, logIn, getUserInfo, answerSurvey, getMySurveys, getUserAnswers, getUsersToSurvey, getMySurvey };