import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Form, Button, Modal, Card } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRankingStar } from '@fortawesome/free-solid-svg-icons';
import LeaderboardModal from '../components/LeaderboardModal';
import { formatDuration } from '../utils';
import ReactSlider from 'react-slider';
import SpinnerComponent from '../components/SpinnerComponent'; // Importação do Spinner

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [isMostPopular, setIsMostPopular] = useState(1);
  const [isLoading, setIsLoading] = useState(true); // Estado de carregamento
  const [durationRange, setDurationRange] = useState([0, 10]);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const token = useSelector((state) => state.user.token);
  const playerId = useSelector((state) => state.user.user?._id);
  const navigate = useNavigate();

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async (filters = {}) => {
    setIsLoading(true); // Ativa o carregamento
    try {
      const response = await axios.get('/api/video/all', { params: filters });
      setVideos(response.data);
    } catch (error) {
      console.error('Erro ao buscar vídeos:', error);
    } finally {
      setIsLoading(false); // Finaliza o carregamento
    }
  };

  const handleApplyFilters = () => {
    const filters = {
      minDuration: durationRange[0] * 60,
      maxDuration: durationRange[1] * 60,
      language: selectedLanguage,
      isMostPopular,
    };
    fetchVideos(filters);
    setShowModal(false);
  };

  const handleShowLeaderboard = (videoId) => {
    setSelectedVideoId(videoId);
    setShowLeaderboard(true);
  };

  return (
    <Container className="home-container min-vh-100">
      <Row className="mt-4">
        <Col className="text-center">
          <Button className='advanced-options-btn rounded-pill' onClick={() => setShowModal(true)}>
            Opções Avançadas 🎛️
          </Button>
        </Col>
      </Row>

      <Row className="mt-4">
        {isLoading ? ( // Exibe o Spinner enquanto os vídeos estão carregando
          <Col className="text-center mt-4">
            <SpinnerComponent />
          </Col>
        ) : videos.length > 0 ? ( // Exibe os vídeos se existirem
          videos.map((video) => (
            <Col key={video._id} md={4} className="mb-4">
              <Card className="video-card" onClick={() => navigate(`/play/${video.videoId}`)}>
                <FontAwesomeIcon
                  icon={faRankingStar}
                  className="ranking-icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShowLeaderboard(video.videoId);
                  }}
                />
                <Card.Img
                  variant="top"
                  src={video.thumbnailURL}
                  alt={video.title}
                />
                <Card.Body>
                  <Card.Title className="card-title">{video.title}</Card.Title>
                  <Card.Text className='mt-3 card-content'>
                    <p>⏳ {formatDuration(video.duration)}</p>
                    <p>🌎 {video.language.charAt(0).toUpperCase() + video.language.slice(1)}</p>
                    <p>🎮 {video.playedTimes} Reproduções</p>
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : ( // Se não houver vídeos, exibe a mensagem
          <Col className="text-center mt-4">
            <h4 className="no-videos">Nenhum vídeo encontrado!</h4>
          </Col>
        )}
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)} className='advanced-options-modal'>
        <Modal.Header closeButton>
          <Modal.Title>Opções Avançadas</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="languageSelect" className="mb-4">
              <Form.Label>Idioma:</Form.Label>
              <Form.Control
                as="select"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
              >
                <option value="">Todos</option>
                {['português', 'inglês', 'espanhol', 'francês', 'alemão', 'italiano', 'japonês', 'coreano', 'chinês', 'russo'].map((language, index) => (
                  <option key={index} value={language}>
                    {language.charAt(0).toUpperCase() + language.slice(1)}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="durationRange" className="mb-3">
              <Form.Label>Duração (minutos):</Form.Label>
              <ReactSlider
                className="custom-slider"
                thumbClassName="custom-thumb"
                trackClassName={(index) =>
                  index === 1 ? "custom-track-active" : "custom-track"
                }
                min={0}
                max={10}
                value={durationRange}
                onChange={setDurationRange}
                pearling
                minDistance={1}
              />
              <div className="d-flex mt-2 justify-content-between">
                <span>{durationRange[0]} min</span>
                <span>{durationRange[1]} min</span>
              </div>
            </Form.Group>

            <Form.Group controlId="popularitySelect" className="mb-3">
              <Form.Label>Reproduções:</Form.Label>
              <div className="d-flex">
                <Form.Check
                  type="radio"
                  label="Mais populares"
                  name="popularity"
                  value="mostPopular"
                  id="mostPopular"
                  checked={isMostPopular}
                  onChange={() => setIsMostPopular(1)}
                  className="me-3"
                />
                <Form.Check
                  type="radio"
                  label="Menos populares"
                  name="popularity"
                  value="leastPopular"
                  id="leastPopular"
                  checked={!isMostPopular}
                  onChange={() => setIsMostPopular(0)}
                />
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Fechar</Button>
          <Button variant="primary" onClick={handleApplyFilters}>Aplicar</Button>
        </Modal.Footer>
      </Modal>

      {selectedVideoId && (
        <LeaderboardModal
          show={showLeaderboard}
          onClose={() => setShowLeaderboard(false)}
          videoId={selectedVideoId}
          playerId={playerId}
        />
      )}
    </Container>
  );
};

export default Home;
