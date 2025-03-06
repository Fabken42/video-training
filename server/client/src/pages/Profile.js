import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clearUser } from '../redux/user/userSlice';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SpinnerComponent from '../components/SpinnerComponent'; // Importação do Spinner
import { Container, Button } from 'react-bootstrap';
import { DEFAULT_PROFILE_PICTURE } from '../utils';
import NotFound from '../components/NotFound';

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { playerId } = useParams();
  const loggedInUser = useSelector((state) => state.user.user);
  const [player, setPlayer] = useState(null);
  const [rankingCounts, setRankingCounts] = useState(null);
  const [rankingGlobal, setRankingGlobal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleLogout = () => {
    if (window.confirm('Deseja sair de sua conta?')) {
      dispatch(clearUser());
      navigate('/login');
    }
  }

  useEffect(() => {
    const fetchPlayer = async () => {
      setIsLoading(true);
      try {
        const { data } = await axios.get(`/api/users/${playerId}`);
        setPlayer(data);
        setRankingCounts(data.rankingCounts);
        setRankingGlobal(data.rankingGlobal);
      } catch (error) {
        console.error('Erro ao carregar jogador:', error);
        setPlayer(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlayer();
  }, [playerId]);

  if (isLoading) {
    return (
      <div className="profile-container">
        <SpinnerComponent />
      </div>
    );
  }

  if (!player) {
    return (
      <NotFound />
    )
  }

  const isOwnProfile = loggedInUser && loggedInUser._id === playerId;

  // return (
  //   <Container fluid className='pt-5 mt-5 d-flex justify-content-center'>
  //     <div className="profile-card">
  //       {rankingCounts ? (
  //         <div className="rankings mb-4">
  //           {Object.entries(rankingCounts).map(([key, value]) => (
  //             <div key={key} className={`ranking ranking-${key.toLowerCase()}`}>
  //               <div className="ranking-circle">{key}</div>
  //               <span className="ranking-number">{value}</span>
  //             </div>
  //           ))}
  //         </div>
  //       ) : (
  //         <p className="no-rankings">Nenhum jogo concluído...</p>
  //       )}

  //       <div className="profile-header">
  //         <div className="profile-image mb-2">
  //           <img src={player.photoUrl || DEFAULT_PROFILE_PICTURE} alt="Perfil" />
  //         </div>
  //         <h2 className='mb-3 player-name '>{player.name}</h2>
  //         <p>{player.description || '{ sem descrição }'}</p>
  //         <p className='fs-5'>Ranking Global: <strong>{rankingGlobal ?? 'Indefinido'}</strong></p>
  //       </div>

  //       <div className="profile-info">
  //         <p className='fs-5'>Pontuação Total: <strong>{player.totalPoints}</strong></p>

  //         {isOwnProfile && (
  //           <div className="profile-buttons">
  //             <Link to="/change-profile" className="btn btn-primary rounded-pill shadow-sm edit-profile-btn">
  //               Editar Perfil
  //             </Link>
  //             <Button variant="danger" onClick={handleLogout} className="rounded-pill shadow-sm logout-btn">
  //               Sair
  //             </Button>
  //           </div>
  //         )}
  //       </div>
  //     </div>
  //   </Container>

  // );
  return (
    <Container fluid className="d-flex flex-column min-vh-100 justify-content-center align-items-center">
      <div className="profile-wrapper d-flex flex-column align-items-center">
        <div className="profile-card">
          {rankingCounts ? (
            <div className="rankings mb-4">
              {Object.entries(rankingCounts).map(([key, value]) => (
                <div key={key} className={`ranking ranking-${key.toLowerCase()}`}>
                  <div className="ranking-circle">{key}</div>
                  <span className="ranking-number">{value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-rankings">Nenhum jogo concluído...</p>
          )}
  
          <div className="profile-header">
            <div className="profile-image mb-2">
              <img src={player.photoUrl || DEFAULT_PROFILE_PICTURE} alt="Perfil" />
            </div>
            <h2 className="mb-3 player-name">{player.name}</h2>
            <p>{player.description || "{ sem descrição }"}</p>
            <p className="fs-5">
              Ranking Global: <strong>{rankingGlobal ?? "Indefinido"}</strong>
            </p>
          </div>
  
          <div className="profile-info">
            <p className="fs-5">
              Pontuação Total: <strong>{player.totalPoints}</strong>
            </p>
  
            {isOwnProfile && (
              <div className="profile-buttons">
                <Link to="/change-profile" className="btn btn-primary rounded-pill shadow-sm edit-profile-btn">
                  Editar Perfil
                </Link>
                <Button variant="danger" onClick={handleLogout} className="rounded-pill shadow-sm logout-btn">
                  Sair
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
  
};

export default Profile;
