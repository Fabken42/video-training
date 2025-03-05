// server/routes/userRoutes.js
const express = require('express');
const { getAllVideos, getVideoByVideoId, getVideoStats, getVideoLeaderboard, getGeneralLeaderboard, updatePersonalBest, increaseVideoViewCount } = require('../controllers/Video.js');
const { protect, isAdmin } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/all', getAllVideos);
router.get('/byVideoId/:videoId', getVideoByVideoId);
router.get('/stats', protect, isAdmin, getVideoStats);
router.get('/individual-leaderboard/:videoId/:playerId', getVideoLeaderboard);
router.get('/general-leaderboard/:playerId?/:language?', getGeneralLeaderboard);
router.put('/update-personal-best/:videoId', protect, updatePersonalBest);
router.put('/increase-video-view-count/:videoId', increaseVideoViewCount);

module.exports = router; 