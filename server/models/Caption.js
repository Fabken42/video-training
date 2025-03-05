const mongoose = require('mongoose');

const CaptionSchema = new mongoose.Schema({
  videoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Video', required: true },
  content: { type: String, required: true } // Armazenar o conteúdo da legenda em formato .srt
});

module.exports = mongoose.model('Caption', CaptionSchema);