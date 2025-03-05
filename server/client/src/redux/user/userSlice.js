// src/features/userSlice.js
import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    user: null, // Dados do usuário
    token: null, // Armazena o token JWT
  },
  reducers: {
    setUser(state, action) {
      state.user = action.payload.user;
      state.token = action.payload.token; // Armazena o token ao definir o usuário
    },
    clearUser(state) {
      state.user = null;
      state.token = null; // Remove o token ao limpar o usuário
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
