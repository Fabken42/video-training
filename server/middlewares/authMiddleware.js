// server/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {

  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extrair o token do cabeçalho
      token = req.headers.authorization.split(' ')[1];
      // Verificar o token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Obter o usuário correspondente ao token
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      console.error('Erro:', error);
      res.status(401).json({ message: 'Não autorizado, token inválido' });
    }
  }

  if (!token) {
    console.log('Não autorizado, sem token');
    res.status(401).json({ message: 'Não autorizado, sem token' });
  }
};

const isOwner = async (req, res, next) => {
  const userIdFromToken = req.user.id; // ID do token JWT
  const userIdFromRequest = req.params.userId || req.body.userId; // ID enviado na rota ou no corpo


  if (userIdFromToken !== userIdFromRequest) {
    console.log('Acesso negado. Você só pode modificar seus próprios dados.');
    return res.status(403).json({ message: 'Acesso negado. Você só pode modificar seus próprios dados.' });
  }
  console.log('Acesso permitido. É o dono dos dados.');
  next();
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    console.log('Acesso permitido. É um administrador.');
    next();
  } else {
    console.log('Acesso negado, apenas administradores.');
    res.status(403).json({ message: 'Acesso negado, apenas administradores.' });
  }
};

module.exports = { protect, isOwner, isAdmin };
