import React, { useState, useEffect } from 'react';
import { Modal, Table } from 'react-bootstrap';
import axios from 'axios';
import { useSelector } from 'react-redux';
import SpinnerComponent from './SpinnerComponent';
import { DEFAULT_PROFILE_PICTURE } from '../utils';
import { useNavigate } from 'react-router-dom';

const LeaderboardModal = ({ show, onClose, videoId, playerId }) => {
    const navigate = useNavigate();
    const [leaderboard, setLeaderboard] = useState([]);
    const [playerInfo, setPlayerInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const playerName = useSelector((state) => state.user.user?.name);

    useEffect(() => {
        if (show) {
            const fetchLeaderboard = async () => {
                setLoading(true);
                try {
                    const response = await axios.get(`/api/video/individual-leaderboard/${videoId}/${playerId}`);
                    setLeaderboard(response.data.leaderboard);
                    setPlayerInfo(response.data.playerInfo);
                } catch (error) {
                    console.error('Erro ao buscar ranking:', error);
                }
                setLoading(false);
            };
            fetchLeaderboard();
        }
    }, [show, videoId, playerId]);

    if (loading) {
        return (
            <SpinnerComponent />
        )
    }

    else if (leaderboard.length === 0 && !loading) {
        return (
            <Modal show={show} onHide={() => onClose()} centered className='empty-leaderboard--modal'>
                <Modal.Header closeButton>
                    <Modal.Title>Placar de Líderes</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Sem registros de pontuação no momento!</p>
                </Modal.Body>
            </Modal>
        );
    }

    return (
        <Modal show={show} onHide={() => onClose()} centered size="lg" className="leaderboard-modal">
            <Modal.Body>
                <Table className="leaderboard-table" responsive>
                    <thead>
                        <tr>
                            <th>Posição</th>
                            <th>Jogador</th>
                            <th>Pontuação</th>
                            <th>Precisão (%)</th>
                            <th>Ranking</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaderboard.map((player, index) => (
                            <tr key={index}>
                                <td>#{index + 1}</td>
                                <td className="clickable-player" onClick={() => window.open(`/profile/${player.playerId}`, '_blank')}>
                                    <img
                                        src={player.playerPhotoUrl || DEFAULT_PROFILE_PICTURE}
                                        alt={player.playerName}
                                    />
                                    {player.playerName}
                                </td>
                                <td>{player.score}</td>
                                <td>{player.precision.toFixed(1)}%</td>
                                <td>{player.ranking}</td>
                            </tr>
                        ))}
                        {playerInfo && !leaderboard.some(p => p.playerId === playerId) && (
                            <>
                                <tr><td colSpan="5" className="text-center">...</td></tr>
                                <tr>
                                    <td>#{playerInfo.position}</td>
                                    <td className="clickable-player" onClick={() => window.open(`/profile/${playerId}`, '_blank')}>
                                        <img
                                            src={playerInfo.playerPhotoUrl}
                                            alt={playerInfo.playerName}
                                        />
                                        {playerInfo.playerName}
                                    </td>
                                    <td>{playerInfo.score}</td>
                                    <td>{playerInfo.precision.toFixed(2)}%</td>
                                    <td>{playerInfo.ranking}</td>
                                </tr>
                            </>
                        )}
                    </tbody>
                </Table>
            </Modal.Body>
        </Modal>

    );
};

export default LeaderboardModal;
