import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Alert } from '../utils.js';
import { Container, Row, Col, Form, Button, Table } from 'react-bootstrap';

const YouGlishSearch = () => {
  const languageMap = [
    { portuguese: "português", english: "portuguese" },
    { portuguese: "inglês", english: "english" },
    { portuguese: "espanhol", english: "spanish" },
    { portuguese: "francês", english: "french" },
    { portuguese: "alemão", english: "german" },
    { portuguese: "italiano", english: "italian" },
    { portuguese: "japonês", english: "japanese" },
    { portuguese: "coreano", english: "korean" },
    { portuguese: "chinês", english: "chinese" },
    { portuguese: "russo", english: "russian" },
  ];

  const widgetRef = useRef(null);
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState('english');
  const [currentVideo, setCurrentVideo] = useState(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDuration, setVideoDuration] = useState(0);
  const [thumbnailURL, setThumbnailURL] = useState('');
  const [videoStats, setVideoStats] = useState([]);
  const [captionFile, setCaptionFile] = useState(null);
  const [videoId, setVideoId] = useState('');

  // Obter o token do Redux
  const token = useSelector((state) => state.user.token);

  useEffect(() => {
    // Carregar o código da API do YouGlish
    const tag = document.createElement('script');
    tag.src = "https://youglish.com/public/emb/widget.js";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    // Função chamada quando a API do YouGlish estiver pronta
    window.onYouglishAPIReady = () => {
      widgetRef.current = new window.YG.Widget("widget-container", {
        width: 640,
        components: 9, // search box & caption
        events: {
          'onFetchDone': onFetchDone,
          'onVideoChange': onVideoChange,
          'onCaptionConsumed': onCaptionConsumed
        }
      });
    };

    // Buscar estatísticas dos vídeos
    fetchVideoStats();
  }, []);

  const fetchVideoStats = async () => {
    try {
      const response = await axios.get('/api/video/stats', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setVideoStats(response.data);
    } catch (error) {
      console.error('Erro ao buscar estatísticas dos vídeos:', error);
    }
  };

  // Função para processar a busca
  const searchYouGlish = () => {
    if (widgetRef.current) {
      widgetRef.current.fetch(query, language);
    }
  };

  // Adicionar evento de tecla ao input
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      searchYouGlish();
    }
  };

  // Função para lidar com o upload do arquivo de legenda
  const handleCaptionUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('videoId', videoId);
    formData.append('caption', captionFile);

    try {
      const response = await axios.post('/api/caption/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      Alert.success('Legenda enviada com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar legenda:', error);
      Alert.error('Erro ao enviar legenda.');
    }
  };

  // Funções de callback para eventos do widget
  const onFetchDone = (event) => {
    if (event.totalResult === 0) {
      Alert.error("Nenhum resultado encontrado");
    }
  };

  const onVideoChange = async (event) => {
    console.log("Novo vídeo carregado:", event.video);
    setCurrentVideo(event.video);

    try {
      const apiKey = process.env.REACT_APP_YOUTUBE_API_KEY; // Usar a chave da API do YouTube do arquivo .env
      const response = await axios.get(`https://www.googleapis.com/youtube/v3/videos?id=${event.video}&part=snippet,contentDetails&key=${apiKey}`);
      const videoData = response.data.items[0];
      const title = videoData.snippet.title;
      const duration = convertISO8601ToSeconds(videoData.contentDetails.duration);
      const thumbnailURL = videoData.snippet.thumbnails.high.url; // Usar miniatura de alta qualidade

      console.log("Título do vídeo:", title);
      console.log("Duração do vídeo:", duration);
      console.log("Thumbnail URL:", thumbnailURL);

      setVideoTitle(title);
      setVideoDuration(duration);
      setThumbnailURL(thumbnailURL);
    } catch (error) {
      console.error('Erro ao buscar detalhes do vídeo:', error);
    }
  };

  const onCaptionConsumed = (event) => {
    console.log("Legenda consumida:", event.id);
  };

  // Função para converter duração ISO 8601 para segundos
  const convertISO8601ToSeconds = (isoDuration) => {
    const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
    const matches = isoDuration.match(regex);

    const hours = parseInt(matches[1]) || 0;
    const minutes = parseInt(matches[2]) || 0;
    const seconds = parseInt(matches[3]) || 0;

    return hours * 3600 + minutes * 60 + seconds;
  };

  // Função para adicionar o vídeo ao MongoDB
  const addVideoToDB = async () => {
    if (currentVideo) {
      try {
        // Encontre o idioma em português com base no valor em inglês
        const languageInPortuguese = languageMap.find(
          (lang) => lang.english === language
        )?.portuguese;

        const response = await axios.post(
          '/api/admin/adicionar-video',
          {
            videoId: currentVideo,
            title: videoTitle, // Usando o título original do vídeo no YouTube
            duration: videoDuration, // Duração do vídeo em segundos
            language: languageInPortuguese || language, // Fallback para inglês caso não encontre
            thumbnailURL: thumbnailURL,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        Alert.success('Vídeo adicionado com sucesso!');
        fetchVideoStats(); // Atualizar as estatísticas após adicionar o vídeo
      } catch (error) {
        console.error('Erro ao adicionar vídeo:', error);
        Alert.error('Erro ao adicionar vídeo.');
      }
    } else {
      Alert.error('Nenhum vídeo selecionado.');
    }
  };


  return (
    <Container className="admin-container mt-4">
      <h2 className="admin-title">Gerenciamento de Vídeos</h2>

      <Row className="justify-content-center">
        <Col md={8}>
          <Form className="admin-form">
            <Form.Group controlId="language-select" className="mt-2">
              <Form.Label>Idioma</Form.Label>
              <Form.Control
                as="select"
                onChange={(e) => setLanguage(e.target.value)}
                value={language}
              >
                {languageMap.map((lang) => (
                  <option key={lang.english} value={lang.english}>
                    {lang.portuguese}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="search-input" className='mt-3'>
              <Form.Label>Buscar Vídeo</Form.Label>
              <Form.Control
                type="text"
                placeholder="Digite uma palavra e pressione Enter"
                onKeyPress={handleKeyPress}
                onChange={(e) => setQuery(e.target.value)}
              />
            </Form.Group>
            <Button variant="primary" className="admin-button mt-3" onClick={searchYouGlish}>
              Buscar
            </Button>
          </Form>
        </Col>
      </Row>

      <Row className="justify-content-center mt-4">
        <Col md={8} className="text-center widget-container">
          <div id="widget-container"></div>
          <Button variant="secondary" className="admin-button mt-3" onClick={() => widgetRef.current && widgetRef.current.previous()}>
            Anterior
          </Button>
          <Button variant="success" className="admin-button mt-3 mx-2" onClick={addVideoToDB}>
            Adicionar Vídeo
          </Button>
          <Button variant="secondary" className="admin-button mt-3" onClick={() => widgetRef.current && widgetRef.current.next()}>
            Próximo
          </Button>
        </Col>
      </Row>

      <Row className="justify-content-center mt-5">
        <Col md={10} className="table-container">
          <h3 className="text-center">Estatísticas dos Vídeos por Idioma</h3>
          <Table striped bordered hover className="table">
            <thead>
              <tr>
                <th>Idioma</th>
                <th>Vídeo com Maior Duração</th>
                <th>Vídeo com Menor Duração</th>
                <th>Duração Média</th>
                <th>Mais Vezes Jogado</th>
                <th>Menos Vezes Jogado</th>
                <th>Total de Jogos</th>
                <th>Total de Vídeos</th>
              </tr>
            </thead>
            <tbody>
              {videoStats.map((stat) => (
                <tr key={stat.language}>
                  <td>{stat.language}</td>
                  <td>{stat.longestVideo.title} ({stat.longestVideo.duration} seg)</td>
                  <td>{stat.shortestVideo.title} ({stat.shortestVideo.duration} seg)</td>
                  <td>{stat.averageDuration.toFixed(0)} seg</td>
                  <td>{stat.mostPlayedVideo.title} ({stat.mostPlayedVideo.playedTimes} vezes)</td>
                  <td>{stat.leastPlayedVideo.title} ({stat.leastPlayedVideo.playedTimes} vezes)</td>
                  <td>{stat.totalPlayedTimes} vezes</td>
                  <td>{stat.totalVideos}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>

      <Row className="justify-content-center mt-5">
        <Col md={6} className="upload-section">
          <h3 className="text-center">Enviar Legenda</h3>
          <Form onSubmit={handleCaptionUpload}>
            <Form.Group controlId="videoId" className="mb-3">
              <Form.Label>ID do Vídeo</Form.Label>
              <Form.Control
                type="text"
                placeholder="Digite o ID do vídeo"
                value={videoId}
                onChange={(e) => setVideoId(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="captionFile" className="mb-3">
              <Form.Label>Arquivo de Legenda (.srt)</Form.Label>
              <Form.Control
                type="file"
                accept=".srt"
                onChange={(e) => setCaptionFile(e.target.files[0])}
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="admin-button">
              Enviar Legenda
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );

};

export default YouGlishSearch;