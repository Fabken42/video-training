// server/index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const userRoutes = require('./routes/User.js');
const videoRoutes = require('./routes/Video.js')
const adminRoutes = require('./routes/Admin.js');
const captionRoutes = require('./routes/Caption.js');

const app = express();
const PORT = process.env.PORT || 5000; //8080 ou 5000

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));

// Rotas
app.use('/api/users', userRoutes);
app.use('/api/video', videoRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/caption', captionRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.use(express.static(`${__dirname}/client/build`));
app.get('*', (req, res) => {
  res.sendFile(`${__dirname}/client/build/index.html`);
});

// MongoDB Connection  
const mongoURI = process.env.MONGO_URI;
mongoose
  .connect(mongoURI)
  .then(() => console.log('Conectado ao MongoDB'))
  .catch((err) => {
    console.error('MongoDB erro de conexão:', err);
    process.exit(1);
  });

// Start Server
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta: http://localhost:${PORT}`);
}); 
