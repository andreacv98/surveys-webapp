"use strict"

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

export {getOpenSurveys, getSurvey};