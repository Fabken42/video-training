// src/components/Header.js
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Container, Navbar, Nav } from "react-bootstrap";
import { DEFAULT_PROFILE_PICTURE } from "../utils";

const Header = () => {
  const user = useSelector((state) => state.user.user);
  const [expanded, setExpanded] = useState(false); // Estado para controlar o toggle

  const profileImage =
    user?.photoUrl || DEFAULT_PROFILE_PICTURE;

  return (
    <Navbar expand="lg" className="header-light" expanded={expanded}>
      <Container>
        <Navbar.Brand as={Link} to="/" className="site-title-light" onClick={() => setExpanded(false)}>
          <span className="title-gradient">🎬 Video Training</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" onClick={() => setExpanded(expanded ? false : true)} />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/leaderboard" className="nav-link-light nav-link-light placar-lideres-link" onClick={() => setExpanded(false)}>
              Placar de Líderes
            </Nav.Link>
            {user ? (
              <>
                <Nav.Link as={Link} to={`/profile/${user._id}`} className="profile-link" onClick={() => setExpanded(false)}>
                  <img className="profile-img" src={profileImage} alt="Perfil" />
                </Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" className="nav-link-light" onClick={() => setExpanded(false)}>
                  Entrar
                </Nav.Link>
                <Nav.Link as={Link} to="/register" className="nav-link-light" onClick={() => setExpanded(false)}>
                  Registrar
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
