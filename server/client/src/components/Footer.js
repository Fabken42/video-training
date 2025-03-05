import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faPhone } from '@fortawesome/free-solid-svg-icons';
import { faLinkedin, faGithub } from '@fortawesome/free-brands-svg-icons';

const Footer = () => {
    return (
            <Container className='footer-container pt-5 pb-3' fluid>
                <Row className="justify-content-center text-center">
                    <Col md={4} className="contact-info">
                        <h5>Entre em contato:</h5>
                        <p><FontAwesomeIcon icon={faEnvelope} /> fabken42@gmail.com</p>
                        <p><FontAwesomeIcon icon={faPhone} /> +55 11 95381-8106</p>
                    </Col>
                    <Col md={4} className="social-icons">
                        <h5>Minhas redes:</h5>
                        <a href="https://www.linkedin.com/in/fabr%C3%ADcio-kohatsu-7486a9279/" target="_blank" rel="noopener noreferrer">
                            <FontAwesomeIcon icon={faLinkedin} size='lg'/>
                        </a>
                        <a href="https://github.com/Fabken42" target="_blank" rel="noopener noreferrer">
                            <FontAwesomeIcon icon={faGithub} size='lg'/>
                        </a>
                    </Col>
                </Row>
            </Container>
    );
};

export default Footer;