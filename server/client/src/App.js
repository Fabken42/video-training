import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header.js';
import Login from './pages/Login.js';
import Register from './pages/Register.js';
import Home from './pages/Home.js'; // Exemplo de página protegida
import Profile from './pages/Profile.js';
import ChangeProfile from './pages/ChangeProfile.js';
import YouGlishSearch from './api/YouglishSearch.js';
import PlayVideo from './components/PlayVideo/PlayVideo.js';
import Leaderboard from './pages/Leaderboard.js';
import AdminRoute from './components/AdminRoute.js';
import NotFound from './components/NotFound.js';
import Footer from './components/Footer.js';

const App = () => {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile/:playerId" element={<Profile />} />
        <Route path="/change-profile" element={<ChangeProfile />} />
        <Route path="/" element={<Home />} />
        <Route path="/play/:videoId" element={<PlayVideo />} />
        <Route path='/leaderboard' element={<Leaderboard />} />
        
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<YouGlishSearch />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer/>
    </Router>
  );
};

export default App;
