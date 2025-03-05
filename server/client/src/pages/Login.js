import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/user/userSlice.js';
import { auth, provider, signInWithPopup } from '../firebaseConfig.js';
import AuthLayout from '../components/AuthLayout.js';
import { Button, Form } from 'react-bootstrap';
import axios from 'axios';
import { Alert } from '../utils.js';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('/api/users/login', form);
      dispatch(setUser({ user: data, token: data.token })); // Salva no Redux
      Alert.success('Login realizado com sucesso!');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      console.log(err);
      const errorMsg = err.response?.data?.message || 'Erro ao fazer login';
      setError(errorMsg);
      Alert.error(errorMsg); // 🔥 Exibe toast de erro
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const { email, displayName } = result.user;

      const { data } = await axios.post('/api/users/google', {
        email,
        name: displayName,
      });

      dispatch(setUser({ user: data, token: data.token }));
      Alert.success('Login realizado com sucesso!');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Erro ao autenticar com Google:', error);
      Alert.error('Falha ao autenticar com Google'); 
    }
  };

  return (
    <AuthLayout title="Login">
      <Form onSubmit={handleSubmit}>
        {error && <p className="text-danger text-center" style={{fontSize: '1.2em'}}>{error}</p>}
        <Form.Group className="mb-3">
          <Form.Label>Email:</Form.Label>
          <Form.Control
          className='rounded-pill'
          type="email"
            name="email"
            placeholder="Digite seu email"
            value={form.email}
            onChange={handleChange}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Senha:</Form.Label>
          <Form.Control
          className='rounded-pill'
            type="password"
            name="password"
            placeholder="Digite sua senha"
            value={form.password}
            onChange={handleChange}
          />
        </Form.Group>
        <Button type="submit" className="btn-entrar w-100 my-3 rounded-pill">
          Entrar
        </Button>
      </Form>
      <Button className="btn-google w-100 mb-3 rounded-pill" onClick={handleGoogleLogin}>
        Continuar com Google
      </Button>
      <hr className="mt-2" />
      <p className="text-center">
        Ainda não tem uma conta? <Link to="/register">Registrar</Link>
      </p>
    </AuthLayout>
  );
};

export default Login;
