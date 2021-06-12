import {Nav, Navbar, NavItem, Button} from 'react-bootstrap';
import {Link} from 'react-router-dom';

function TopNavbar(props) {

    const loggedIn = props.loggedIn;
    const admin = props.admin;
    const logout = props.logout;
    const loginPage = props.loginPage;

    return (
        <>
        <Navbar bg="dark" variant="dark">
            <Navbar.Brand href="/">
                SurveyThemAll
            </Navbar.Brand>
            {loginPage ?
                null
            :
                <>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    {loggedIn ?
                        <>
                            <Nav className="mr-auto">
                                <Nav.Link href="#home">Home</Nav.Link>
                                <Nav.Link href="#link">Link</Nav.Link>
                            </Nav>
                        </>
                    :
                    <>
                        <Nav className="mr-auto">
                        </Nav>
                    </>
                    }
                    
                    
                    <Nav>
                        <NavItem>
                            <>
                            {loggedIn ?
                            <Button variant="success" onClick={logout}>
                                Logout
                            </Button>
                            
                            
                            :
                            
                            <Link to={"/login"}>
                                <Button variant="success">
                                    LogIn
                                </Button>
                            </Link> 

                            }
                            </>
                        </NavItem>
                    </Nav>
                </Navbar.Collapse>
                </>
            }
            

        </Navbar>    
        </>
    );
}


export {TopNavbar};