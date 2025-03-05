import React, { useState } from 'react';
import { Row, Col, Button } from 'react-bootstrap';

const OptionsPanel = ({ options, handleOptionClick }) => {
  const [buttonStates, setButtonStates] = useState(
    options.map(() => ({ status: 'default', shaking: false }))
  );

  const handleClick = (option, groupIndex) => {
    const isCorrect = handleOptionClick(option, groupIndex);

    // Atualiza o estado do botão para mostrar correto/incorreto
    setButtonStates((prev) =>
      prev.map((state, index) =>
        index === groupIndex
          ? { status: isCorrect ? 'correct' : 'incorrect', shaking: !isCorrect }
          : state
      )
    );

    // Remove o estilo de resposta após 300ms
    setTimeout(() => {
      setButtonStates((prev) =>
        prev.map((state, index) =>
          index === groupIndex ? { ...state, status: 'default', shaking: false } : state
        )
      );
    }, 300); // Tempo para a cor sumir
  };

  return (
    <Row className="justify-content-center my-4">
      <Col md={8} className="d-flex flex-wrap justify-content-around">
        {options.map((group, groupIndex) =>
          group.length > 0 ? ( // Verifica se o grupo tem pelo menos 1 elemento
            <Button
              key={groupIndex}
              className={`rounded-pill option-button ${buttonStates[groupIndex].status
                } ${buttonStates[groupIndex].shaking ? 'shake' : ''}`}
              onClick={() => handleClick(group[0], groupIndex)}
              disabled={!group[0]} // Desabilita o botão se não houver opção
            >
              {group[0].replace(/[.,!?;:]/g, '') || '-'} {/* Remove pontuações */}
            </Button>
          ) : (
            <Button
              key={groupIndex}
              className="rounded-pill option-button btn-disabled"
              disabled
            >
              -
            </Button>
          )
        )}
      </Col>
    </Row>
  );
};

export default OptionsPanel;
