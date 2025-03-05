// src/pages/AuthLayout.js
import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const AuthLayout = ({ children, title }) => {
  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Row className="w-100">
        <Col md={{ span: 6, offset: 3 }} className="auth-container p-4 rounded shadow">
          <h1 className="text-center mb-4">{title}</h1>
          {children}
        </Col>
      </Row>
    </Container>
  );
};

export default AuthLayout;
