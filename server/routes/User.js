const express = require('express');
const {
  loginWithGoogle,
  registerUser,
  loginUser,
  getUserProfile,
  getUserProgress,
  updateProfile,
  uploadProfilePicture,
  deleteAccount,
  getPlayerInfoById
} = require('../controllers/User.js');
const { protect, isOwner } = require('../middlewares/authMiddleware.js');
const router = express.Router();

// Para manipulação de arquivos
const fileUpload = require('express-fileupload');
router.use(fileUpload({ useTempFiles: true }));


// Rota para login ou registro pelo Google
router.post('/google', loginWithGoogle);

// Rota para registro
router.post('/register', registerUser);

// Rota para login
router.post('/login', loginUser);

// Rota para obter informações do perfil (somente para usuários autenticados) 
router.get('/profile', protect, getUserProfile);

// Rota para obter progresso do jogador
router.get('/progress/:userId', getUserProgress);

// Rota para obter informações de um jogador específico
router.get('/:playerID', getPlayerInfoById);

// Rota para fazer upload da foto de perfil
router.post('/uploadProfilePicture', protect, isOwner, uploadProfilePicture);

// Rota para atualizar o perfil (somente o próprio usuário)
router.put('/updateProfile', protect, isOwner, updateProfile);

// Rota para deletar conta
router.delete('/deleteAccount/:userId', protect, isOwner, deleteAccount);

module.exports = router;