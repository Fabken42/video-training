// src/pages/Register.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/user/userSlice';
import { auth, provider, signInWithPopup } from '../firebaseConfig';
import AuthLayout from '../components/AuthLayout';
import { Button, Form } from 'react-bootstrap';
import axios from 'axios';
import { Alert } from '../utils';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const isValidPassword = (password) => {
    return {
      length: password.length >= 8 && password.length <= 100,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
  };

  const passwordChecks = isValidPassword(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.name.length < 3 || form.name.length > 50) {
      setError('O nome deve ter entre 3 e 50 caracteres.');
      return;
    }

    if (form.email.length < 5 || form.email.length > 200) {
      setError('O email deve ter entre 5 e 200 caracteres.');
      return;
    }

    if (!Object.values(passwordChecks).every(Boolean)) {
      setError('A senha não atende a todos os requisitos.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('As senhas não coincidem!');
      return;
    }

    try {
      const { data } = await axios.post('/api/users/register', form);
      dispatch(setUser({ user: data, token: data.token }));
      Alert.success('Usuário registrado com sucesso!');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao registrar usuário');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const { email, displayName, photoURL } = result.user;

      const { data } = await axios.post('/api/users/google', {
        email,
        name: displayName,
        photoUrl: photoURL,
      });

      dispatch(setUser({ user: data, token: data.token }));
      Alert.success('Login realizado com sucesso!');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Erro ao autenticar com Google:', error);
      Alert.error('Falha ao autenticar com Google'); // 🔥 Exibe toast de erro
    }
  };

  return (
    <AuthLayout title="Registrar">
      <Form onSubmit={handleSubmit}>
        {error && <p className="text-danger text-center" style={{ fontSize: '1.2em' }}>{error}</p>}

        <Form.Group className="mb-3">
          <Form.Label>Nome:</Form.Label>
          <Form.Control
            className="rounded-pill"
            type="text"
            name="name"
            placeholder="Digite seu nome (3-50 caracteres)"
            value={form.name}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Email:</Form.Label>
          <Form.Control
            className="rounded-pill"
            type="email"
            name="email"
            placeholder="Digite seu email (5-100 caracteres)"
            value={form.email}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Senha:</Form.Label>
          <Form.Control
            className="rounded-pill"
            type="password"
            name="password"
            placeholder="Digite sua senha"
            value={form.password}
            onChange={handleChange}
          />
          <ul className="password-checklist mt-2">
            <li style={{ color: passwordChecks.length ? '#3f3' : '#f33' }}>✔ Entre 8 e 100 caracteres</li>
            <li style={{ color: passwordChecks.uppercase ? '#3f3' : '#f33' }}>✔ Pelo menos uma letra maiúscula</li>
            <li style={{ color: passwordChecks.lowercase ? '#3f3' : '#f33' }}>✔ Pelo menos uma letra minúscula</li>
            <li style={{ color: passwordChecks.number ? '#3f3' : '#f33' }}>✔ Pelo menos um número</li>
            <li style={{ color: passwordChecks.special ? '#3f3' : '#f33' }}>✔ Pelo menos um caractere especial (!@#$%^&*(),.?":&#123;&#125;|<></>)</li>
          </ul>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Confirmar Senha:</Form.Label>
          <Form.Control
            className="rounded-pill"
            type="password"
            name="confirmPassword"
            placeholder="Confirme sua senha"
            value={form.confirmPassword}
            onChange={handleChange}
          />
          {form.confirmPassword && (
            <p style={{ color: form.password === form.confirmPassword ? '#3f3' : '#f33', fontSize: '0.9em', marginTop: '5px' }}>
              {form.password === form.confirmPassword ? '✔ Senhas coincidem' : '✖ Senhas não coincidem'}
            </p>
          )}
        </Form.Group>

        <Button type="submit" className="btn-entrar w-100 my-3 rounded-pill">
          Registrar
        </Button>
      </Form>

      <Button className="btn-google w-100 mb-3 rounded-pill" onClick={()=> handleGoogleLogin()}>
        Continuar com Google
      </Button>

      <hr className="mt-2" />
      <p className="text-center">
        Já tem uma conta? <Link to="/login">Entrar</Link>
      </p>
    </AuthLayout>
  );
};

export default Register;