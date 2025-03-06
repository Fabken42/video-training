import { toast } from 'react-toastify';
import axios from 'axios';

const MISSING_WORDS_PERCENTAGE = 0.1;

export const DEFAULT_PROFILE_PICTURE = 'https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg';

export const fetchVideoById = async (videoId) => {
  const response = await axios.get(`/api/video/byVideoId/${videoId}`);
  return response.data._id;
};

export const fetchCaptions = async (mongoVideoId) => {
  const response = await axios.get(`/api/caption/get?videoId=${mongoVideoId}`);

  const captions = parseCaptions(response.data.content);
  return generateMissingWords(captions, MISSING_WORDS_PERCENTAGE);
};

export const generateMissingWords = (captions, percentage) => {
  const updatedCaptions = [...captions];
  const missingWords = [];

  updatedCaptions.forEach((caption, captionIndex) => {
    const words = caption.text.match(/[\wÀ-ÿ]+(?:’[\wÀ-ÿ]+)?|[\wÀ-ÿ]+(?:'[\wÀ-ÿ]+)?|[.,!?;:]/g
    ) || [];

    const numMissingWords = Math.ceil(words.length * percentage);

    let missingIndexes = [];
    while (missingIndexes.length < numMissingWords) {
      const randomIndex = Math.floor(Math.random() * words.length);

      // Evita substituir pontuações ou palavras já removidas
      if (!missingIndexes.includes(randomIndex) && /\w/.test(words[randomIndex])) {
        missingIndexes.push(randomIndex);
      }
    }
    missingIndexes.sort((a, b) => a - b);

    missingIndexes.forEach((index) => {
      missingWords.push({
        word: words[index].toUpperCase(), // Armazena só a palavra sem pontuação
        captionIndex,
        wordIndex: index,
      });

      words[index] = '{missingWord}';
    });

    caption.text = words.join(' '); // Recompõe a legenda com pontuações intactas
  });

  return { updatedCaptions, missingWords };
};

export const parseTime = (time) => {
  const parts = time.split(':');
  const seconds = parseFloat(parts[2].replace(',', '.'));
  return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + seconds;
};

export const parseCaptions = (data) => {
  const lines = data.split('\n');
  const captions = [];
  let start, duration, text;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('-->')) {
      const times = lines[i].split(' --> ');
      start = parseTime(times[0]);
      duration = parseTime(times[1]) - start;
    } else if (lines[i].trim() === '') {
      if (text) captions.push({ start, duration, text });
      text = '';
    } else if (!isNaN(lines[i])) {
      continue;
    } else {
      text = text ? `${text} ${lines[i]}` : lines[i];
    }
  }
  return captions;
};

// Função para formatar duração em "minutos : segundos"
export const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const Alert = {
  success: (message) => {
    toast.success(message, {
      position: 'top-right', // Especificar a posição diretamente como string
      autoClose: 2000,
    });
  },
  error: (message) => {
    toast.error(message, {
      position: 'top-right', // Especificar a posição diretamente como string
      autoClose: 2000,
    });
  },
};
