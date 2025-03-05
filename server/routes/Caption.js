const express = require('express');
const multer = require('multer');
const { addCaption, getCaption } = require('../controllers/Caption.js');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

const upload = multer({ dest: 'uploads/' });

router.post('/upload', protect, upload.single('caption'), addCaption);
router.get('/get', getCaption);

module.exports = router;