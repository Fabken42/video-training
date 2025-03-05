// server/controllers/userController.js
const User = require('../models/User');
const Video = require('../models/Video.js')
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cloudinary = require('../cloudinary.js');

// Gera um token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const getPlayerInfoById = async (req, res) => {
  const { playerID } = req.params;

  try {
    // Buscar o jogador pelo ID
    const player = await User.findById(playerID).select('-password');
    if (!player) {
      return res.status(404).json({ message: 'Jogador não encontrado' });
    }

    // Contagem de rankings (S, A, B, C, D)
    const rankingCounts = { S: 0, A: 0, B: 0, C: 0, D: 0 };
    player.completedVideos.forEach(video => {
      if (rankingCounts[video.ranking] !== undefined) {
        rankingCounts[video.ranking]++;
      }
    });

    // 🔹 Ajuste para ranking global considerando desempate por precisão
    const higherRankedPlayers = await User.countDocuments({
      $or: [
        { totalPoints: { $gt: player.totalPoints } },
        {
          totalPoints: player.totalPoints,
          averagePrecision: { $gt: player.averagePrecision }
        }
      ]
    });

    const rankingGlobal = higherRankedPlayers + 1;

    // Retornar os dados com ranking real
    res.status(200).json({
      ...player.toObject(),
      rankingCounts,
      rankingGlobal,
    });

  } catch (error) {
    console.error('Erro ao buscar jogador:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};

// Atualizar perfil (nome e foto)
const updateProfile = async (req, res) => {
  const { userId, photoId, name, description } = req.body;

  try {
    // Buscar usuário
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Atualizar nome
    if (name) user.name = name;

    // Atualizar descrição (máximo de 100 caracteres)
    if (description) user.description = description.substring(0, 100);

    // Atualizar foto (Cloudinary)
    if (photoId) {
      const result = await cloudinary.uploader.upload(photoId, {
        folder: 'profile_pictures',
        public_id: `user_${userId}`,
        overwrite: true,
      });
      user.photoUrl = result.secure_url;
    }

    await user.save();
    res.status(200).json({ message: 'Perfil atualizado com sucesso', user });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ message: 'Erro ao atualizar perfil' });
  }
};

const uploadProfilePicture = async (req, res) => {
  try {
    const file = req.files.file;
    if (!file) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado' });
    }

    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: 'profile_pictures',
      public_id: `user_${req.user.id}` // Agora a imagem terá um nome único baseado no ID do usuário
    });

    // Salvamos tanto a URL quanto o public_id no banco
    await User.findByIdAndUpdate(req.user.id, {
      photoUrl: result.secure_url,
      cloudinaryId: result.public_id // Novo campo para armazenar o public_id
    });

    res.status(200).json({ fileId: result.secure_url });

  } catch (error) {
    console.error('Erro ao fazer upload da foto:', error);
    res.status(500).json({ message: 'Erro ao fazer upload da foto' });
  }
};

const deleteAccount = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // 🔹 Excluir a foto do Cloudinary usando o `cloudinaryId`
    if (user.cloudinaryId) {
      await cloudinary.uploader.destroy(user.cloudinaryId);
    }

    // 🔹 Remover referências do usuário em vídeos e rankings
    await Video.updateMany(
      { "playedBy.playerId": userId },
      { $pull: { playedBy: { playerId: userId } } }
    );

    await User.updateMany(
      { "completedVideos.videoId": { $exists: true } },
      { $pull: { completedVideos: { playerId: userId } } }
    );

    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: 'Conta deletada com sucesso' });

  } catch (error) {
    console.error('Erro ao deletar conta:', error);
    res.status(500).json({ message: 'Erro ao deletar conta' });
  }
};

// Função para garantir nome de usuário único
const generateUniqueUsername = async (name) => {
  let newName = name;
  let exists = await User.findOne({ name: newName });

  while (exists) {
    const randomNumber = Math.floor(10000 + Math.random() * 90000); // Número aleatório de 5 dígitos
    newName = `${name}${randomNumber}`;
    exists = await User.findOne({ name: newName });
  }

  return newName;
};

// Login ou Registro pelo Google
const loginWithGoogle = async (req, res) => {
  const { email, name } = req.body;

  try {
    // Verifica se o usuário já existe pelo email
    let user = await User.findOne({ email });

    // Se não existe, cria um novo usuário com nome único
    if (!user) {
      const uniqueName = await generateUniqueUsername(name);

      user = await User.create({
        name: uniqueName,
        email,
        password: undefined, // Usuários do Google não têm senha
        role: 'user',
      });
    }

    // Retorna os dados do usuário e token
    res.status(200).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      photoUrl: user.photoUrl,
      role: user.role,
      totalPoints: user.totalPoints,
      completedVideos: user.completedVideos,
      token: generateToken(user.id),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao autenticar com Google' });
  }
};

// Registro do Usuário
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const emailExists = await User.findOne({ email });
    if (emailExists) return res.status(400).json({ message: 'Email já registrado!' });

    const nameExists = await User.findOne({ name });
    if (nameExists) return res.status(400).json({ message: 'Nome já está em uso!' });

    const isValidPassword = (password) => {
      return {
        length: password.length >= 8 && password.length <= 100,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      };
    };

    const passwordChecks = isValidPassword(password);
    if (!Object.values(passwordChecks).every(Boolean)) {
      return res.status(400).json({ message: 'A senha deve conter entre 8 e 100 caracteres, pelo menos uma letra maiúscula, uma letra minúscula, um número e um caractere especial!' });
    }

    // Criar o usuário
    const user = await User.create({
      name,
      email,
      password,
      role: 'user',
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        photoUrl: user.photoUrl,
        role: user.role,
        token: generateToken(user.id),
      });
    } else {
      res.status(400).json({ message: 'Dados inválidos!' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor!', error: error.message });
  }
};

// Login do Usuário
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        photoUrl: user.photoUrl,
        role: user.role,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: 'Email ou senha inválidos!' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor!', error: error.message });
  }
};

// Obter Perfil do Usuário
const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user) {
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
    });
  } else {
    res.status(404).json({ message: 'Usuário não encontrado' });
  }
};

// Exibir progresso do jogador
const getUserProgress = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate('completedVideos.videoId');
    res.json(user.completedVideos);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar progresso do jogador' });
  }
};

module.exports = {
  loginWithGoogle,
  registerUser,
  loginUser,
  getUserProfile,
  getUserProgress,
  updateProfile,
  uploadProfilePicture,
  deleteAccount,
  getPlayerInfoById
}; 