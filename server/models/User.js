// server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, minLength: 3, maxLength: 50 },
    email: { type: String, required: true, unique: true, minLength: 5, maxLength: 100 },
    password: { type: String, minLength: 8, maxLength: 100 },
    description: { type: String, default: '', maxlength: 100 },
    photoUrl: { type: String, default: 'https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg' },
    totalPoints: { type: Number, default: 0, required: true }, // Total acumulado de pontos em todos os vídeos
    averagePrecision: { type: Number, default: 0, required: true }, // Média de precisão em todos os vídeos
    completedVideos: [
      {
        videoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Video' }, // Referência ao vídeo
        ranking: { type: String, enum: ['S', 'A', 'B', 'C', 'D'], required: true }, // Ranking
        score: { type: Number, required: true }, // Pontuação no vídeo
        precision: { type: Number, required: true }, // Precisão no vídeo
      },
    ],
    role: { type: String, enum: ['user', 'admin'], default: 'user' }, // Adicionado o campo 'role'
  },
  {
    timestamps: true, // Adiciona campos createdAt e updatedAt automaticamente
  }
);

// Middleware para hash da senha antes de salvar
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Método para comparar senha
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
