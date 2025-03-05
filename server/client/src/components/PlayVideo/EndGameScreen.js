import React, { useState, useEffect } from 'react';
import { Container, Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import LeaderboardModal from '../LeaderboardModal.js';

export default function EndGameScreen({ score, onRestart, onExit, ranking, precision }) {
    const { videoId } = useParams();
    const playerId = useSelector(state => state.user.user?._id);
    const token = useSelector(state => state.user.token);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [isUpdating, setIsUpdating] = useState(true);

    useEffect(() => {
        const updatePersonalBest = async () => {
            try {
                if (playerId) {
                    await axios.put(`/api/video/update-personal-best/${videoId}`, {
                        playerId,
                        score,
                        ranking,
                        precision
                    }, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                } else {
                    await axios.put(`/api/video/increase-video-view-count/${videoId}`);
                }
            } catch (error) {
                console.error('Erro ao atualizar pontuação:', error.response?.data || error.message);
            } finally {
                setIsUpdating(false);
            }
        };
        updatePersonalBest();
    }, [playerId, videoId, score, ranking, token]);

    if (isUpdating) return null;

    return (
        <Container className="text-center end-game-screen">
            {!token && <p><a href='/register' className="register-link">Registre-se</a> para salvar sua pontuação!</p>}
            <h2 className="game-over-title mt-4">Fim de Jogo!</h2>
            <p className="game-score">Pontuação: <strong>{score}</strong></p>
            <p className="game-precision">Precisão: <strong>{precision.toFixed(1)}%</strong></p>
            <p className="game-ranking">Ranking: <strong>{ranking}</strong></p>

            <div className="button-container">
                <Button className="rounded-pill btn-restart mt-3" onClick={onRestart}>Jogar Novamente</Button>
                <Button className="rounded-pill btn-leaderboard" onClick={() => setShowLeaderboard(true)}>Placar de Líderes</Button>
                <Button className="rounded-pill btn-exit" onClick={onExit}>Início</Button>
            </div>

            {showLeaderboard && (
                <LeaderboardModal
                    show={showLeaderboard}
                    onClose={() => setShowLeaderboard(false)}
                    videoId={videoId}
                    playerId={playerId}
                />
            )}
        </Container>
    );
}
