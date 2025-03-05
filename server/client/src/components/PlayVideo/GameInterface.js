import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle } from '@fortawesome/free-solid-svg-icons';

const GameInterface = ({ captions, currentCaptionIndex }) => {
  const currentCaption = captions[currentCaptionIndex]?.text || '';
  const nextCaption = captions[currentCaptionIndex + 1]?.text || '';

  const renderCaption = (caption) => {
    return caption.split(/(\s+)/).map((word, index) =>
      word === '{missingWord}' ? (
        <FontAwesomeIcon key={index} icon={faCircle} />
      ) : (
        word
      )
    );
  };

  return (
    <Row className="justify-content-center">
      <Col md={8}>
        <div className="game-interface">
          <div className="captions">
            <p>{renderCaption(currentCaption)}</p>
            <p>{renderCaption(nextCaption)}</p>
          </div>
        </div>
      </Col>
    </Row>
  );
};

export default GameInterface;
