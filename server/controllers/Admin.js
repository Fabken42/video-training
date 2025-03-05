// controllers/Admin.js
const Video = require('../models/Video');

// Controlador para adicionar um vídeo
const addVideo = async (req, res) => {
  console.log('Adicionando vídeo:', req.body);
  
  const { videoId, title, duration, language, thumbnailURL } = req.body;

  try {
    // Verificar se o vídeo já existe
    let video = await Video.findOne({ videoId });
    if (video) {
      return res.status(400).json({ message: 'Vídeo já existe' });
    }

    // Criar um novo vídeo
    video = new Video({
      videoId,
      title, 
      duration,
      language,
      thumbnailURL,
      playedTimes: 0,
      playedBy: []
    });

    // Salvar o vídeo no MongoDB
    await video.save();

    res.status(201).json({ message: 'Vídeo adicionado com sucesso', video });
  } catch (error) {
    console.error('Erro ao adicionar vídeo:', error);
    res.status(500).json({ message: 'Erro ao adicionar vídeo' });
  } 
};

module.exports = { addVideo };