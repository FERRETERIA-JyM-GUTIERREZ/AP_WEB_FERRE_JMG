import React from 'react';
import { useAuth } from '../context/AuthContext';
import Favoritos from '../pages/Favoritos';
import Wishlist from '../pages/Wishlist';

const FavoritosRouter = () => {
  const { isAuthenticated } = useAuth();

  // Para usuarios autenticados, usar Wishlist (API)
  // Para usuarios no autenticados, usar Favoritos (localStorage)
  if (isAuthenticated()) {
    return <Wishlist />;
  } else {
    return <Favoritos />;
  }
};

export default FavoritosRouter;

