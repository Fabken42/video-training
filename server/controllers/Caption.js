const Caption = require('../models/Caption');
const Video = require('../models/Video');
const fs = require('fs');
const path = require('path');

const addCaption = async (req, res) => {
  const { videoId } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: 'Nenhum arquivo enviado' });
  }

  try {
    const video = await Video.findOne({ videoId });
    if (!video) {
      return res.status(404).json({ message: 'Vídeo não encontrado' });
    }

    const content = fs.readFileSync(file.path, 'utf-8');
    const newCaption = new Caption({ videoId: video._id, content }); //problema nesta linha
    await newCaption.save();

    // Remover o arquivo temporário
    fs.unlinkSync(file.path);

    res.status(201).json(newCaption);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao adicionar legenda', error });
  }
};

const getCaption = async (req, res) => {
  const { videoId } = req.query;
  try {
    const caption = await Caption.findOne({ videoId });
    if (!caption) {
      return res.status(404).json({ message: 'Legenda não encontrada' });
    }
    res.status(200).json(caption);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar legenda', error });
  }
};

module.exports = { addCaption, getCaption };