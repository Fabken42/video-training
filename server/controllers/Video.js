const User = require('../models/User');
const Video = require('../models/Video');

// Controlador para buscar estatísticas dos vídeos por idioma
const getVideoStats = async (req, res) => {
  try {
    console.log('Buscando estatísticas dos vídeos...');
    const stats = await Video.aggregate([
      {
        $group: {
          _id: '$language',
          longestVideo: { $max: '$duration' },
          shortestVideo: { $min: '$duration' },
          averageDuration: { $avg: '$duration' },
          mostPlayedVideo: { $max: '$playedTimes' },
          leastPlayedVideo: { $min: '$playedTimes' },
          totalPlayedTimes: { $sum: '$playedTimes' },
          totalVideos: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'videos',
          localField: 'longestVideo',
          foreignField: 'duration',
          as: 'longestVideoDetails'
        }
      },
      {
        $lookup: {
          from: 'videos',
          localField: 'shortestVideo',
          foreignField: 'duration',
          as: 'shortestVideoDetails'
        }
      },
      {
        $lookup: {
          from: 'videos',
          localField: 'mostPlayedVideo',
          foreignField: 'playedTimes',
          as: 'mostPlayedVideoDetails'
        }
      },
      {
        $lookup: {
          from: 'videos',
          localField: 'leastPlayedVideo',
          foreignField: 'playedTimes',
          as: 'leastPlayedVideoDetails'
        }
      },
      {
        $project: {
          language: '$_id',
          longestVideo: { $arrayElemAt: ['$longestVideoDetails', 0] },
          shortestVideo: { $arrayElemAt: ['$shortestVideoDetails', 0] },
          averageDuration: 1,
          mostPlayedVideo: { $arrayElemAt: ['$mostPlayedVideoDetails', 0] },
          leastPlayedVideo: { $arrayElemAt: ['$leastPlayedVideoDetails', 0] },
          totalPlayedTimes: 1,
          totalVideos: 1
        }
      }
    ]);

    res.status(200).json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas dos vídeos:', error);
    res.status(500).json({ message: 'Erro ao buscar estatísticas dos vídeos' });
  }
};

const getAllVideos = async (req, res) => {
  try {
    const { language, minDuration, maxDuration, isMostPopular = 1 } = req.query;
    const query = {};

    if (language) query.language = language;
    if (minDuration) query.duration = { $gte: parseInt(minDuration) };
    if (maxDuration) {
      if (!query.duration) query.duration = {};
      query.duration.$lte = parseInt(maxDuration); 
    } 

    const sortOrder = isMostPopular == 1 ? -1 : 1; // -1 = mais populares primeiro, 1 = menos populares primeiro
    const videos = await Video.find(query).sort({ playedTimes: sortOrder }).limit(24); 

    res.status(200).json(videos);
  } catch (error) {
    console.error('Erro ao buscar vídeos:', error);
    res.status(500).json({ message: 'Erro ao buscar vídeos' });
  }
};

const getVideoByVideoId = async (req, res) => {
  const { videoId } = req.params;
  try {
    const video = await Video.findOne({ videoId });
    if (!video) {
      return res.status(404).json({ message: 'Vídeo não encontrado' });
    }
    res.status(200).json(video);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar vídeo', error });
  }
};

const getVideoLeaderboard = async (req, res) => {
  try {
    const { videoId, playerId } = req.params; // videoId e playerId são passados pela URL

    // Buscar o vídeo pelo videoId
    const video = await Video.findOne({ videoId })
      .populate({
        path: 'playedBy.playerId', // Populate de playerId com os campos 'name' e 'photoUrl'
        select: 'name photoUrl',
      });

    if (!video) {
      return res.status(404).json({ message: 'Vídeo não encontrado' });
    }

    // 🔹 Ordenar os jogadores primeiro por score e depois por precisão
    const sortedPlayers = video.playedBy.sort((a, b) => {
      if (b.score === a.score) {
        return b.precision - a.precision; // Desempate por precisão
      }
      return b.score - a.score;
    });

    // Pegar o Top 5 jogadores
    const leaderboard = sortedPlayers
      .slice(0, 5)
      .map(player => ({
        playerId: player.playerId._id,
        playerName: player.playerId.name,
        playerPhotoUrl: player.playerId.photoUrl,
        score: player.score,
        ranking: player.ranking,
        precision: player.precision
      }));

    // 🔹 Encontrar a posição do jogador especificado
    let playerInfo = null;
    let playerPosition = null;

    sortedPlayers.forEach((player, index) => {
      if (player.playerId._id.toString() === playerId) {
        playerInfo = player;
        playerPosition = index + 1; // Posição é index + 1
      }
    });

    // Retornar os 5 primeiros e a posição do jogador
    return res.json({
      leaderboard,
      playerInfo: playerInfo ? {
        position: playerPosition,
        playerName: playerInfo.playerId.name,
        playerPhotoUrl: playerInfo.playerId.photoUrl,
        score: playerInfo.score,
        ranking: playerInfo.ranking,
        precision: playerInfo.precision
      } : null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

const getGeneralLeaderboard = async (req, res) => {
  try {
    const { playerId, language } = req.params; // Agora recebe idioma como parâmetro opcional

    let videosQuery = {};
    if (language) {
      videosQuery.language = language; // Filtra vídeos pelo idioma selecionado
    }

    const videos = await Video.find(videosQuery).select("playedBy");

    const playerStats = new Map();

    videos.forEach(video => {
      video.playedBy.forEach(({ playerId, score, ranking, precision }) => {
        if (!playerStats.has(playerId.toString())) {
          playerStats.set(playerId.toString(), {
            playerId,
            totalPoints: 0,
            averagePrecision: 0,
            completedVideos: [],
          });
        }
        const player = playerStats.get(playerId.toString());
        player.totalPoints += score;
        player.completedVideos.push({ ranking, precision });
      });
    });

    const users = await User.find({ _id: { $in: [...playerStats.keys()] } })
      .select("name photoUrl");

    const allPlayers = users.map(user => {
      const stats = playerStats.get(user._id.toString());
      const rankSCount = stats.completedVideos.filter(v => v.ranking === "S").length;
      const rankACount = stats.completedVideos.filter(v => v.ranking === "A").length;
      const averagePrecision = (stats.completedVideos.reduce((sum, v) => sum + v.precision, 0) / stats.completedVideos.length).toFixed(2);

      return {
        playerId: user._id,
        name: user.name,
        photoUrl: user.photoUrl,
        totalPoints: stats.totalPoints,
        averagePrecision: parseFloat(averagePrecision), // Convertendo para número para ordenação correta
        rankSCount,
        rankACount,
      };
    });

    // 🔹 Ordena primeiro por totalPoints (desc) e depois por averagePrecision (desc)
    allPlayers.sort((a, b) => {
      if (b.totalPoints === a.totalPoints) {
        return b.averagePrecision - a.averagePrecision; // Desempate por precisão média
      }
      return b.totalPoints - a.totalPoints;
    });

    // Top 10 jogadores
    const leaderboard = allPlayers.slice(0, 10);

    // Busca a posição do usuário logado, mesmo que não esteja no top 10
    let playerInfo = null;
    if (playerId) {
      const playerIndex = allPlayers.findIndex(u => u.playerId.toString() === playerId);
      if (playerIndex !== -1) {
        playerInfo = { ...allPlayers[playerIndex], position: playerIndex + 1 };
      }
    }

    return res.json({ leaderboard, playerInfo });
  } catch (error) {
    console.error("Erro ao buscar ranking geral:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

const increaseVideoViewCount = async (req, res) => {
  try {
    const { videoId } = req.params;
    const video = await Video.findOne({ videoId });
    if (!video) {
      return res.status(404).json({ message: 'Vídeo não encontrado' });
    }
    video.playedTimes += 1; // Incrementa playedTimes
    await video.save();
    res.status(200).json({ message: 'Contagem de visualizações incrementada com sucesso!' });
  } catch (error) {
    console.error('Erro ao incrementar a contagem de visualizações:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
}

const updatePersonalBest = async (req, res) => {
  console.log('Atualizando melhor pontuação pessoal...');
  try {
    const { videoId } = req.params;
    const { playerId, score, ranking, precision } = req.body;

    // Buscar o vídeo pelo videoId
    const video = await Video.findOne({ videoId });
    if (!video) {
      console.log('Vídeo não encontrado');
      return res.status(404).json({ message: 'Vídeo não encontrado' });
    }

    // Buscar o usuário pelo playerId
    const user = await User.findById(playerId);
    if (!user) {
      console.log('Usuário não encontrado');
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const rankingPriority = { S: 5, A: 4, B: 3, C: 2, D: 1 };

    // Atualização no modelo Video
    const playerIndex = video.playedBy.findIndex(entry => entry.playerId.toString() === playerId);

    if (playerIndex !== -1) {
      if (score > video.playedBy[playerIndex].score) {
        video.playedBy[playerIndex].score = score;
        video.playedBy[playerIndex].ranking = ranking;
        video.playedBy[playerIndex].precision = precision;
      } else if (
        score === video.playedBy[playerIndex].score &&
        rankingPriority[ranking] > rankingPriority[video.playedBy[playerIndex].ranking]
      ) {
        video.playedBy[playerIndex].ranking = ranking;
        video.playedBy[playerIndex].precision = precision;
      }
    } else {
      video.playedBy.push({ playerId, score, ranking, precision });
    }

    video.playedTimes += 1; // Incrementa playedTimes
    await video.save();

    // Atualização no modelo User
    const userVideoIndex = user.completedVideos.findIndex(entry => entry.videoId.toString() === video._id.toString());
    let oldScore = 0, newTotalPoints = user.totalPoints;

    if (userVideoIndex !== -1) {
      oldScore = user.completedVideos[userVideoIndex].score;

      if (score > oldScore) {
        newTotalPoints += score - oldScore;
        user.completedVideos[userVideoIndex].score = score;
        user.completedVideos[userVideoIndex].ranking = ranking;
        user.completedVideos[userVideoIndex].precision = precision;
      } else if (
        score === oldScore &&
        rankingPriority[ranking] > rankingPriority[user.completedVideos[userVideoIndex].ranking]
      ) {
        user.completedVideos[userVideoIndex].ranking = ranking;
        user.completedVideos[userVideoIndex].precision = precision;
      }
    } else {
      user.completedVideos.push({ videoId: video._id, score, ranking, precision });
      newTotalPoints += score;
    }

    // Atualizar totalPoints e média de precisão
    user.totalPoints = newTotalPoints;
    const totalPrecision = user.completedVideos.reduce((sum, vid) => sum + vid.precision, 0);
    user.averagePrecision = (totalPrecision / user.completedVideos.length).toFixed(2);

    await user.save();

    res.status(200).json({ message: 'Pontuação e informações do usuário atualizadas com sucesso!' });

  } catch (error) {
    console.error('Erro ao atualizar a pontuação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

module.exports = { getVideoStats, getAllVideos, getVideoByVideoId, getVideoLeaderboard, getGeneralLeaderboard, updatePersonalBest, increaseVideoViewCount };