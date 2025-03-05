import {Link} from 'react-router-dom';

export default function NotFound(){
    return (
        <div className="profile-container text-center min-vh-100">
          <h2 className='text-white mt-5'>Página não encontrada!</h2>
          <Link to="/" className="btn btn-secondary mt-3 rounded-pill">
            Voltar para a página inicial
          </Link>
        </div>
      );
}