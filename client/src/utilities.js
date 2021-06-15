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
        if(!type.includes("application/json")) {
            throw new TypeError("Expected JSON, got "+type);
        }
        const surveys = await response.json();
        return surveys;
    } catch(e) {
        console.log(e);
    }
}

async function getSurvey(id) {
    let url = "/api/opensurveys/"+id;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        let type = response.headers.get("Content-Type");
        if(!type.includes("application/json")) {
            throw new TypeError("Expected JSON, got "+type);
        }
        const surveys = await response.json();
        return surveys;
    } catch(e) {
        console.log(e);
    }
}

async function answerSurvey(insertedData) {
  let url = "/api/answers";

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(insertedData)
        });

        let type = response.headers.get("Content-Type");
        if(!type.includes("application/json")) {
            throw new TypeError("Expected JSON, got "+type);
        }
        let result = {};
        if(response.ok) {
          result = await response.json();
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
        return result;
    } catch(e) {
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


export {getOpenSurveys, getSurvey, logOut, logIn, getUserInfo, answerSurvey};