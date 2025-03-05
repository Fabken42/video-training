const mongoose = require('mongoose');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const crypto = require('crypto');
const path = require('path');

// Conexão ao MongoDB
const mongoURI = process.env.MONGO_URI;
const conn = mongoose.createConnection(mongoURI);

// Configurar GridFS
let gfs;
conn.once('open', () => {
  gfs = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: 'profilePictures' });
});

// Configuração do storage do Multer
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) return reject(err);

        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename,
          bucketName: 'profilePictures',
        };
        resolve(fileInfo);
      });
    });
  },
});

const upload = multer({ storage });

module.exports = { gfs, upload };
