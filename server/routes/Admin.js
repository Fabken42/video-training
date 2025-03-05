// server/routes/Admin.js
const express = require('express');
const { addVideo } = require('../controllers/Admin.js');
const { protect, isAdmin } = require('../middlewares/authMiddleware');
const router = express.Router();

// Rota protegida para adicionar um vídeo
router.post('/adicionar-video', protect, isAdmin, addVideo);

module.exports = router;