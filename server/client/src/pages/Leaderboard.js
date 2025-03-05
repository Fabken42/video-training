import React, { useState, useEffect } from 'react';
import { Container, Table, Modal, Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SpinnerComponent from '../components/SpinnerComponent';
import { DEFAULT_PROFILE_PICTURE } from '../utils';

export default function Leaderboard() {
    const playerId = useSelector(state => state.user.user?._id);
    const [leaderboard, setLeaderboard] = useState([]);
    const [playerInfo, setPlayerInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [show, setShow] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState("");
    const navigate = useNavigate();

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            let url = `/api/video/general-leaderboard`;
            if (selectedLanguage && selectedLanguage !== "todos") {
                url += `/${playerId || "guest"}/${selectedLanguage}`;
            } else if (playerId) {
                url += `/${playerId}`;
            }
            const response = await axios.get(url);
            setLeaderboard(response.data.leaderboard);
            console.log(response.data);
            setPlayerInfo(response.data.playerInfo || null);
        } catch (error) {
            console.error("Erro ao buscar ranking geral:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchLeaderboard();
    }, [playerId, selectedLanguage]);

    return (
        <Container className="mt-4 min-vh-100">
            <select className="form-select my-3 w-auto mx-auto px-5 py-2" value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)}>
                <option value="" disabled hidden>- idioma -</option>
                <option value="todos">Todos</option>
                <option value="português">Português</option>
                <option value="inglês">Inglês</option>
                <option value="espanhol">Espanhol</option>
                <option value="francês">Francês</option>
                <option value="alemão">Alemão</option>
                <option value="italiano">Italiano</option>
                <option value="japonês">Japonês</option>
                <option value="coreano">Coreano</option>
                <option value="chinês">Chinês</option>
                <option value="russo">Russo</option>
            </select>
            <h2 className="text-center mb-4 placar-lideres-titulo">
                Placar de Líderes - {selectedLanguage ? selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1) : 'Todos'}
            </h2>

            <div className="d-flex justify-content-center mb-3">
            </div>

            {loading ? (
                <SpinnerComponent />
            ) : (
                <Table className="leaderboard-table" responsive>
                    <thead>
                        <tr>
                            <th>Posição</th>
                            <th>Jogador</th>
                            <th>Pontuação Total</th>
                            <th>Precisão Média (%)</th>
                            <th>S</th>
                            <th>A</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaderboard.map((player, index) => (
                            <tr key={index}>
                                <td>#{index + 1}</td>
                                <td
                                    className="clickable-player"
                                    onClick={() => window.open(`/profile/${player.playerId}`, '_blank')}
                                >
                                    <img
                                        src={player.photoUrl || DEFAULT_PROFILE_PICTURE}
                                        alt={player.name}
                                    />
                                    {player.name}
                                </td>
                                <td>{player.totalPoints}</td>
                                <td>{player.averagePrecision}%</td>
                                <td>{player.rankSCount}</td>
                                <td>{player.rankACount}</td>
                            </tr>
                        ))}
                        {playerInfo && !leaderboard.some(p => p.playerId === playerId) && (
                            <>
                                <tr><td colSpan="6" className="text-center">...</td></tr>
                                <tr>
                                    <td>#{playerInfo.position}</td>
                                    <td className="clickable-player" onClick={() => window.open(`/profile/${playerId}`, '_blank')}>
                                        <img
                                            src={playerInfo.photoUrl || DEFAULT_PROFILE_PICTURE}
                                            alt={playerInfo.name}
                                        />
                                        {playerInfo.name}
                                    </td>
                                    <td>{playerInfo.totalPoints}</td>
                                    <td>{playerInfo.averagePrecision}%</td>
                                    <td>{playerInfo.rankSCount}</td>
                                    <td>{playerInfo.rankACount}</td>
                                </tr>
                            </>
                        )}
                    </tbody>
                </Table>
            )}
        </Container>
    );
}
