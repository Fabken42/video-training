// server/models/Video.js
const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema(
  {
    videoId: { type: String, required: true, unique: true }, // URL do vídeo
    title: { type: String, required: true }, // Título do vídeo
    duration: { type: Number, required: true }, // Duração do vídeo em segundos
    language: { type: String, required: true, enum: ['português', 'inglês', 'espanhol', 'francês', 'alemão', 'italiano', 'japonês', 'coreano', 'chinês', 'russo'] }, // Idioma do vídeo
    thumbnailURL: { type: String, required: true }, // URL da miniatura do vídeo
    playedTimes: { type: Number, default: 0 }, // Vezes jogadas (determina vídeos mais populares)
    playedBy: [
      {
        playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Referência ao jogador
        score: { type: Number, required: true }, // Pontuação do jogador no vídeo
        ranking: { type: String, enum: ['S', 'A', 'B', 'C', 'D'], required: true }, // Ranking
        precision: { type: Number, required: true },
      },
    ],
  },
  {
    timestamps: true, // Adiciona campos createdAt e updatedAt automaticamente
  }
);

module.exports = mongoose.model('Video', VideoSchema);
