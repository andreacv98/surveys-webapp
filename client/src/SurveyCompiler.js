import { useLocation } from "react-router";

function SurveyCompiler(props) {
    const location = useLocation();
    const idSurvey = location.state.idSurvey;
    return (
        <>
            <p>Id survey: {idSurvey}</p>
        </>
    );
}

export {SurveyCompiler};