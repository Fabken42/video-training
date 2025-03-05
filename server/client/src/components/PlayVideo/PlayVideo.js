import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import VideoPlayer from './VideoPlayer.js';
import GameInterface from './GameInterface.js';
import OptionsPanel from './OptionsPanel.js';
import MultiplierProgress from '../MultiplierProgress.js';
import EndGameScreen from './EndGameScreen.js';
import NotFound from '../NotFound.js';
import SpinnerComponent from '../SpinnerComponent.js';
import { fetchVideoById, fetchCaptions } from '../../utils.js';

const TIME_TO_ANSWER = 3; //tempo de 4 segundos (+1 delay)

const PlayVideo = () => {
  const { videoId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [videoNotFound, setVideoNotFound] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [captions, setCaptions] = useState([]);
  const [currentCaptionIndex, setCurrentCaptionIndex] = useState(0);
  const [missingWords, setMissingWords] = useState([]);
  const [remainingWords, setRemainingWords] = useState([]);
  const [options, setOptions] = useState([[], [], [], []]);
  const [isPausedOnCaption, setIsPausedOnCaption] = useState(false);
  const [progress, setProgress] = useState(100);
  const [score, setScore] = useState(0); // Pontuação
  const [multiplier, setMultiplier] = useState(1); // Multiplicador
  const [streak, setStreak] = useState(0); // Contagem de acertos consecutivos
  const [precision, setPrecision] = useState(0);
  const [timeToAnswer, setTimeToAnswer] = useState(TIME_TO_ANSWER); // Contagem regressiva (segundos)
  const [finalRanking, setFinalRanking] = useState(); // Ranking final
  const [errorCount, setErrorCount] = useState(0); // Novo estado para contar erros
  const [isGameOver, setIsGameOver] = useState(false);
  const playerRef = useRef(null);
  const intervalRef = useRef(null);
  const penaltyInterval = useRef(null); // Intervalo para atualizar o tempo restante

  useEffect(() => {
    const initializeData = async () => {
      try {
        const mongoVideoId = await fetchVideoById(videoId);
        setIsLoading(false);
        if (!mongoVideoId) return setVideoNotFound(true);

        const { updatedCaptions, missingWords } = await fetchCaptions(mongoVideoId);
        setCaptions(updatedCaptions);
        setMissingWords(missingWords);
        setRemainingWords([...missingWords]);
        setOptions(divideMissingWords(missingWords));
        setVideoReady(true);
      } catch (error) {
        console.error('Error initializing data:', error);
        setVideoNotFound(true);
        setIsLoading(false);
      }
    };
    initializeData();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (penaltyInterval.current) clearInterval(penaltyInterval.current);
    };
  }, [videoId]);

  const divideMissingWords = (words) => {
    const updatedOptions = [[], [], [], []];
    const maxSubarrayLength = Math.ceil(words.length / 4);
    const wordToGroupMap = new Map();

    // Separar as 4 últimas palavras
    const lastFourWords = words.slice(-4);
    const remainingWords = words.slice(0, -4);

    // Distribuir as palavras restantes
    remainingWords.forEach((wordObj) => {
      const { word } = wordObj;

      if (wordToGroupMap.has(word)) {
        const groupIndex = wordToGroupMap.get(word);
        updatedOptions[groupIndex].push(word);
      } else {
        let placed = false;
        while (!placed) {
          const randomGroupIndex = Math.floor(Math.random() * 4);
          if (updatedOptions[randomGroupIndex].length < maxSubarrayLength) {
            updatedOptions[randomGroupIndex].push(word);
            wordToGroupMap.set(word, randomGroupIndex);
            placed = true;
          }
        }
      }
    });

    // Criar um array de posições [0,1,2,3] e embaralhar
    const shuffledIndexes = [0, 1, 2, 3].sort(() => Math.random() - 0.5);

    // Distribuir as 4 últimas palavras nas posições embaralhadas
    lastFourWords.forEach((wordObj, index) => {
      updatedOptions[shuffledIndexes[index]].push(wordObj.word);
      wordToGroupMap.set(wordObj.word, shuffledIndexes[index]);
    });

    return updatedOptions;
  };

  const handleOptionClick = (option, groupIndex) => {
    if (penaltyInterval.current) {
      clearInterval(penaltyInterval.current);
      penaltyInterval.current = null;
    }

    const correctWordObj = remainingWords[0];
    if (isPausedOnCaption) startPenaltyCountdown();

    if (option === correctWordObj.word) {
      const updatedCaptions = [...captions];
      const words = updatedCaptions[correctWordObj.captionIndex].text.split(' ');
      words[correctWordObj.wordIndex] = correctWordObj.word;
      updatedCaptions[correctWordObj.captionIndex].text = words.join(' ');
      setCaptions(updatedCaptions);

      const updatedRemainingWords = remainingWords.slice(1);
      setRemainingWords(updatedRemainingWords);

      const updatedOptions = options.map((group, index) =>
        index === groupIndex ? group.slice(1) : group
      );
      setOptions(updatedOptions);

      setScore((prevScore) => prevScore + 10 * multiplier);

      setStreak((prevStreak) => {
        if (multiplier === 8) return 0;
        const newStreak = prevStreak + 1;
        if (newStreak >= 8 && multiplier < 8) {
          setMultiplier((prevMultiplier) => prevMultiplier + 1);
          return 0;
        }
        return newStreak;
      });

      if (!captions[currentCaptionIndex].text.includes('{missingWord}') && isPausedOnCaption) {
        playerRef.current.playVideo();
        setIsPausedOnCaption(false);
      }

      return true;
    } else {
      setMultiplier((prevMultiplier) => Math.max(prevMultiplier - 1, 1));
      setStreak(0);
      setErrorCount((prevErrors) => prevErrors + 1);

      // Se o vídeo ainda estiver pausado, reinicia a contagem regressiva
      if (isPausedOnCaption) {
        startPenaltyCountdown();
      }

      return false;
    }
  };

  // Nova função para iniciar a contagem regressiva de penalidade
  const startPenaltyCountdown = () => {
    if (penaltyInterval.current) {
      clearInterval(penaltyInterval.current);
    }

    setTimeToAnswer(TIME_TO_ANSWER);
    setProgress(100);

    penaltyInterval.current = setInterval(() => {
      setTimeToAnswer((prevTime) => {
        const newTime = prevTime - 1;

        if (newTime < 0) {
          applyPausePenalty();
          setProgress(100);
          return TIME_TO_ANSWER;
        }

        setProgress((newTime / TIME_TO_ANSWER) * 100);
        return newTime;
      });
    }, 1000);
  };

  useEffect(() => {
    if (isPausedOnCaption) {
      startPenaltyCountdown();
    } else {
      if (penaltyInterval.current) {
        clearInterval(penaltyInterval.current);
        penaltyInterval.current = null;
      }
    }
  }, [isPausedOnCaption]);


  const applyPausePenalty = () => {
    setMultiplier((prevMultiplier) => Math.max(prevMultiplier - 1, 1));
    setStreak(0);
    setTimeToAnswer(TIME_TO_ANSWER);
    setErrorCount((prevErrors) => prevErrors + 1); // Contabiliza erro por penalidade
  };

  const handleRestart = () => {
    window.location.reload();
  };

  useEffect(() => {
    if (videoReady && remainingWords.length === 0) {
      const totalWords = missingWords.length;
      const accuracy = ((totalWords / (totalWords + errorCount)) * 100);

      let ranking;
      if (accuracy === 100) {
        ranking = 'S';
      } else if (accuracy >= 90) {
        ranking = 'A';
      } else if (accuracy >= 80) {
        ranking = 'B';
      } else if (accuracy >= 70) {
        ranking = 'C';
      } else {
        ranking = 'D';
      }

      setPrecision(accuracy);
      setFinalRanking(ranking);
      setTimeout(() => {
        setIsGameOver(true);
      }, 3000);
    }
  }, [remainingWords, videoReady]);

  if (isLoading) { return <SpinnerComponent /> }
  else if (videoNotFound) { return <NotFound /> }
  else {
    return (
      <Container className='mt-4'>
        {isGameOver ? (
          <EndGameScreen
            score={score}
            ranking={finalRanking}
            precision={precision}
            onRestart={handleRestart}
            onExit={() => window.location.href = '/'}
          />
        ) : videoReady && (
          <>
            <div>
              <p className='text-center mt-5 score-text'>Pontuação: {score}</p>
              <MultiplierProgress multiplier={multiplier} streak={streak} />

              <div
                style={{
                  width: '50%',
                  height: '10px',
                  backgroundColor: '#ddd',
                  borderRadius: '5px',
                  overflow: 'hidden',
                  margin: '10px auto',
                }}
              >
                <div
                  style={{
                    width: `${progress}%`,
                    height: '100%',
                    backgroundColor: progress > 20 ? '#4caf50' : '#f44336',
                    transition: 'width 1s linear',
                  }}
                ></div>
              </div>
            </div>
            <VideoPlayer
              videoId={videoId}
              playerRef={playerRef}
              captions={captions}
              currentCaptionIndex={currentCaptionIndex}
              setCurrentCaptionIndex={setCurrentCaptionIndex}
              intervalRef={intervalRef}
              isPausedOnCaption={isPausedOnCaption}
              setIsPausedOnCaption={setIsPausedOnCaption}
            />
            <GameInterface captions={captions} currentCaptionIndex={currentCaptionIndex} />
            <OptionsPanel options={options} handleOptionClick={handleOptionClick} />
          </>
        )}
      </Container>
    );
  }
};

export default PlayVideo;