import React, { useEffect, useRef } from 'react';
import { Row, Col } from 'react-bootstrap';
import YouTube from 'react-youtube';

const VideoPlayer = ({
  videoId,
  playerRef,
  captions,
  currentCaptionIndex,
  setCurrentCaptionIndex,
  setIsPausedOnCaption,
  isPausedOnCaption,
}) => {
  const pauseTimerRef = useRef(null); // Armazena o ID do temporizador
  const updateIntervalRef = useRef(null); // Armazena o ID do intervalo de atualização

  const updateCurrentCaptionIndex = () => {
    if (!playerRef.current) return;
  
    const currentTime = playerRef.current.getCurrentTime();
    const currentIndex = captions.findIndex(
      (caption) => currentTime >= caption.start && currentTime <= caption.start + caption.duration
    );
  
    const lineText = captions[currentIndex]?.text || '';
    const lineEnd = captions[currentIndex]?.start + captions[currentIndex]?.duration || 0;
  
    // Atualiza o índice da legenda atual
    if (currentIndex !== -1 && currentIndex !== currentCaptionIndex) {
      console.log(`Atualizando legenda atual para índice: ${currentIndex}`);
      setCurrentCaptionIndex(currentIndex);
    }
  
    // Força pausa se a legenda tiver {missingWord} e o vídeo ainda não estiver pausado
    if (
      currentIndex !== -1 &&
      lineText.includes('{missingWord}') &&
      !isPausedOnCaption
    ) {
      console.log(`Linha ${currentIndex} contém {missingWord}. Verificando para pausa...`);
  
      // Calcula o tempo restante para o término da linha
      const timeToPause = Math.max((lineEnd - currentTime) * 1000, 0);
  
      if (timeToPause <= 100) { //buffer de 100ms
        // Pausa imediata se já estamos próximos do final da linha
        console.log(`Pausando o vídeo imediatamente na linha ${currentIndex}.`);
        playerRef.current.pauseVideo();
        setIsPausedOnCaption(true);
      } else {
        // Configura temporizador para pausar no momento correto
        if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
        pauseTimerRef.current = setTimeout(() => {
          // Valida se ainda há {missingWord} antes de pausar
          if (!captions[currentIndex]?.text.includes('{missingWord}')) {
            console.log(`Linha ${currentIndex} foi completada. Cancelando pausa.`);
            return;
          }
  
          console.log(`Pausando o vídeo na linha ${currentIndex}, com buffer.`);
          playerRef.current.pauseVideo();
          setIsPausedOnCaption(true);
        }, timeToPause);
      }
    }
  };
  
  const startCaptionUpdate = () => {
    if (!playerRef.current) return;
  
    // Atualiza a legenda imediatamente ao iniciar
    updateCurrentCaptionIndex();
  
    // Inicia um intervalo para atualizar a legenda
    if (updateIntervalRef.current) clearInterval(updateIntervalRef.current);
    updateIntervalRef.current = setInterval(updateCurrentCaptionIndex, 75); // Atualiza a cada 75ms
  };
  
  // const stopCaptionUpdate = () => {
  //   if (updateIntervalRef.current) clearInterval(updateIntervalRef.current);
  //   if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
  // };
  const stopCaptionUpdate = () => {
    if (!playerRef.current) return;
  
    const currentTime = playerRef.current.getCurrentTime();
    const newTime = Math.max(currentTime - 1, 0); //em pausas: volta 1 segundo
  
    playerRef.current.seekTo(newTime, true);
  
    if (updateIntervalRef.current) clearInterval(updateIntervalRef.current);
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
  };

  
  useEffect(() => {
    return () => {
      stopCaptionUpdate();
    };
  }, []);
  
  return (
    <Row className="justify-content-center mt-5">
      <Col md={8}>
        <YouTube
          videoId={videoId}
          opts={{ width: '100%', height: '390' }}
          onReady={(event) => (playerRef.current = event.target)}
          onPlay={startCaptionUpdate}
          onPause={stopCaptionUpdate}
        />
      </Col>
    </Row>
  );
};

export default VideoPlayer;
