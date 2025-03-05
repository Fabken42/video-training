import React from "react";
import { Spinner } from "react-bootstrap";

export default function SpinnerComponent() {
  return (
    <div className="text-center text-primary mt-5">
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Carregando...</span>
      </Spinner>
    </div>
  );
}