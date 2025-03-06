// src/pages/ChangeProfile.js
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { setUser, clearUser } from '../redux/user/userSlice';
import { Alert } from '../utils';
import { DEFAULT_PROFILE_PICTURE } from '../utils';
import { useNavigate } from 'react-router-dom';
 
const ChangeProfile = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  const token = useSelector((state) => state.user.token);
  const [photo, setPhoto] = useState(null);
  const [name, setName] = useState(user?.name);
  const [description, setDescription] = useState(user?.description);
  const [preview, setPreview] = useState(user?.photoUrl || DEFAULT_PROFILE_PICTURE);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const dispatch = useDispatch();

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      const validTypes = ["image/jpeg", "image/png", "image/webp"];

      if (!validTypes.includes(file.type)) {
        Alert.error("Formato inválido! Selecione uma imagem JPEG, PNG ou WEBP.");
        return;
      }

      setPhoto(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('userId', user._id);

    if (photo) {
      formData.append('file', photo);
    }

    try {
      setLoadingSubmit(true);
      let photoId;
      if (photo) {
        const { data } = await axios.post('/api/users/uploadProfilePicture', formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        photoId = data.fileId;
      }

      const response = await axios.put(
        '/api/users/updateProfile',
        { userId: user._id, name, description, photoId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      dispatch(setUser({ user: response.data.user, token }));
      console.log(response.data.user)
      Alert.success('Perfil atualizado com sucesso!');
      setLoadingSubmit(false);
    } catch (error) {
      setLoadingSubmit(false);
      Alert.error('Erro ao atualizar perfil!');
      console.error('Erro ao atualizar perfil:', error);
    }
  };


  const handleDeleteAccount = async () => {
    if (window.confirm('Tem certeza que deseja deletar sua conta?')) {
      try {
        await axios.delete(`/api/users/deleteAccount/${user._id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        dispatch(clearUser());
        Alert.success('Conta deletada com sucesso!');
        setTimeout(() => {
          navigate('/register');
        }, 2000);
      } catch (error) {
        console.error('Erro ao deletar conta:', error);
      }
    }
  };

  // return (
  //   <div className="change-profile-container container--margem-cima">
  //     <button className="btn btn-secondary back-btn rounded-pill mb-3 texto--fonte w-100" onClick={() => window.history.back()}>
  //       Voltar
  //     </button>
  //     <form className="profile-form" onSubmit={handleSubmit}>
  //       <h2 className="text-center titulo--fonte">Editar Perfil</h2>

  //       <div className="profile-image-container">
  //         {/* Agora a imagem funciona como botão para selecionar uma nova foto */}
  //         <label htmlFor="photo-upload">
  //           <img src={preview} alt="Foto de perfil" className="my-3 profile-image-preview" />
  //         </label>
  //         <input
  //           type="file"
  //           id="photo-upload"
  //           accept="image/*"
  //           onChange={handlePhotoChange}
  //           className="hidden-input"
  //         />
  //       </div>

  //       <div className="mb-3">
  //         <label className="texto--fonte text-start d-block mb-1">Nome (3-50 caracteres):</label>
  //         <input
  //           type="text"
  //           className="form-control rounded-pill"
  //           value={name}
  //           onChange={(e) => setName(e.target.value)}
  //           minLength="3"
  //           maxLength="50"
  //         />
  //       </div>

  //       <div className="mb-3">
  //         <label className="texto--fonte text-start d-block mb-1">Descrição (0-100 caracteres):</label>
  //         <input
  //           type="text"
  //           className="form-control rounded-pill"
  //           value={description}
  //           onChange={(e) => setDescription(e.target.value)}
  //           maxLength="100"
  //         />
  //       </div>

  //       <button type="submit" className="btn btn-success save-btn texto--fonte my-2">
  //         {loadingSubmit ? "Carregando..." : "💾 Salvar Alterações"}
  //       </button>
  //     </form>

  //     <button onClick={handleDeleteAccount} className="btn btn-danger delete-btn texto--fonte">
  //       ❌ Deletar Conta
  //     </button>
  //   </div>
  // );
  return (
    <div className="d-flex flex-column min-vh-100 justify-content-center align-items-center" fluid>
      <div className="change-profile-wrapper d-flex flex-column align-items-center">
        <div className="change-profile-container">
          <button
            className="btn btn-secondary back-btn rounded-pill mb-3 texto--fonte w-100"
            onClick={() => window.history.back()}
          >
            Voltar
          </button>
  
          <form className="profile-form" onSubmit={handleSubmit}>
            <h2 className="text-center titulo--fonte">Editar Perfil</h2>
  
            <div className="profile-image-container">
              <label htmlFor="photo-upload">
                <img src={preview} alt="Foto de perfil" className="my-3 profile-image-preview" />
              </label>
              <input
                type="file"
                id="photo-upload"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden-input"
              />
            </div>
  
            <div className="mb-3">
              <label className="texto--fonte text-start d-block mb-1">Nome (3-50 caracteres):</label>
              <input
                type="text"
                className="form-control rounded-pill"
                value={name}
                onChange={(e) => setName(e.target.value)}
                minLength="3"
                maxLength="50"
              />
            </div>
  
            <div className="mb-3">
              <label className="texto--fonte text-start d-block mb-1">Descrição (0-100 caracteres):</label>
              <input
                type="text"
                className="form-control rounded-pill"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength="100"
              />
            </div>
  
            <button type="submit" className="btn btn-success save-btn texto--fonte my-2">
              {loadingSubmit ? "Carregando..." : "💾 Salvar Alterações"}
            </button>
          </form>
  
          <button onClick={handleDeleteAccount} className="btn btn-danger delete-btn texto--fonte">
            ❌ Deletar Conta
          </button>
        </div>
      </div>
    </div>
  );
  
};

export default ChangeProfile;
