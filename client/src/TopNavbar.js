import {Nav, Navbar, NavItem, Button, Form} from 'react-bootstrap';
import {Link, useLocation} from 'react-router-dom';
import {IndexLinkContainer} from 'react-router-bootstrap';

function TopNavbar(props) {

    const location = useLocation();
    const loggedIn = props.loggedIn;
    const admin = props.admin;
    const logout = props.logout;
    const loginPage = props.loginPage;

    return (
        <>
        <Navbar style={{background: "#1e0838"}} variant="dark">
            <Link to="/">
                <Navbar.Brand>
                    SurveyThemAll
                </Navbar.Brand>
            </Link>
            
            {loginPage ?
                null
            :
                <>
                    {loggedIn ?
                        <>
                            <Nav className="mr-auto" defaultActiveKey={location.pathname === "/" ? null : location.pathname.slice(1)}>
                                <IndexLinkContainer to="/addSurvey" key="addSurvey">
                                    <Nav.Link>
                                        Add Survey
                                    </Nav.Link>
                                </IndexLinkContainer>
                                <IndexLinkContainer to="/mySurveys"  key="mySurveys">
                                    <Nav.Link>
                                        My Surveys
                                    </Nav.Link>
                                </IndexLinkContainer>
                            </Nav>
                        </>
                    :
                    <>
                        <Nav className="mr-auto">
                        </Nav>
                    </>
                    }

                    <Nav>
                        
                    </Nav>
                                       
                    
                    <Nav>
                    
                        <NavItem>
                            <>
                            {loggedIn ?
                            <>
                                <Form inline>
                                    <Navbar.Text className="light">
                                        Signed in as: <b>{admin}</b>
                                    </Navbar.Text> 
                                    <Button variant="warning" onClick={logout}>
                                        Logout
                                    </Button>
                                </Form>
                                
                            </>                         
                                                        
                            :
                            
                            <Link to={"/login"}>
                                <Button variant="primary">
                                    LogIn
                                </Button>
                            </Link> 

                            }
                            </>
                        </NavItem>
                    </Nav>
                </>
            }
            

        </Navbar>    
        </>
    );
}


export {TopNavbar};