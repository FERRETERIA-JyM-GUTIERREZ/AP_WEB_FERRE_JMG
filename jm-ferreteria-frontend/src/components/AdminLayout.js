import React from 'react';
import { useAuth } from '../context/AuthContext';

const AdminLayout = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated()) {
    return children;
  }

  // Solo aplicar margen izquierdo si NO es cliente
  // Los clientes tienen navegación horizontal, no sidebar
  if (user?.rol === 'cliente') {
    return children;
  }

  return (
    <div className="lg:ml-64">
      {children}
    </div>
  );
};

export default AdminLayout;
