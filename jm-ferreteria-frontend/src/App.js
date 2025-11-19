import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Catalogo from './pages/Catalogo';
import SobreNosotros from './pages/SobreNosotros';
import Contacto from './pages/Contacto';
import Login from './pages/Login';
import StaffLogin from './pages/StaffLogin';
import UnifiedLogin from './pages/UnifiedLogin';
import SideBySideLogin from './pages/SideBySideLogin';
import ClientLoginOnly from './pages/ClientLoginOnly';
import StaffLoginProtected from './pages/StaffLoginProtected';
import StaffOnlyLogin from './pages/StaffOnlyLogin';
import SmartLogin from './pages/SmartLogin';
import GoogleCallback from './pages/GoogleCallback';
import Register from './pages/Register';
import LoginSelector from './pages/LoginSelector';
import Dashboard from './pages/Dashboard';
import Inventario from './pages/Inventario';
import Ventas from './pages/Ventas';
import Reportes from './pages/Reportes';
import Usuarios from './pages/Usuarios';
import AdminRoute from './components/AdminRoute';
import PrivateRoute from './components/PrivateRoute';
import './index.css';
import ProductoDetalle from './pages/ProductoDetalle';
import Carrito from './pages/Carrito';
import MisCompras from './pages/MisCompras';
import Favoritos from './pages/Favoritos';
import Wishlist from './pages/Wishlist';
import FavoritosRouter from './components/FavoritosRouter';
import Perfil from './pages/Perfil';
import Checkout from './pages/Checkout';
import Pedidos from './pages/Pedidos';
import GestionRoles from './pages/GestionRoles';
import Calendario from './pages/Calendario';
import Notas from './pages/Notas';
import ArbolNavidad from './components/ArbolNavidad';
import FloatingContactButtons from './components/FloatingContactButtons';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
          <div className="App">
              <Toaster 
                position="top-center"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    style: {
                      background: '#10b981',
                    },
                  },
                  error: {
                    duration: 5000,
                    style: {
                      background: '#ef4444',
                    },
                  },
                }}
              />
              <Navbar />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/catalogo" element={<Catalogo />} />
                  <Route path="/sobre-nosotros" element={<SobreNosotros />} />
                  <Route path="/contacto" element={<Contacto />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/auth/google/callback" element={<GoogleCallback />} />
                  <Route path="/staff-protected" element={<StaffLoginProtected />} />
                  <Route path="/staff-login" element={<StaffOnlyLogin />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/admin-login" element={<StaffLogin />} />
                  <Route path="/login-selector" element={<LoginSelector />} />
                  <Route path="/dashboard" element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  } />
                  <Route path="/inventario" element={
                    <PrivateRoute>
                      <Inventario />
                    </PrivateRoute>
                  } />
                  <Route path="/ventas" element={
                    <PrivateRoute>
                      <Ventas />
                    </PrivateRoute>
                  } />
                  <Route path="/pedidos" element={
                    <PrivateRoute>
                      <Pedidos />
                    </PrivateRoute>
                  } />
                  <Route path="/reportes" element={
                    <PrivateRoute>
                      <Reportes />
                    </PrivateRoute>
                  } />
                  <Route path="/usuarios" element={
                    <AdminRoute>
                      <Usuarios />
                    </AdminRoute>
                  } />
                  <Route path="/gestion-roles" element={
                    <PrivateRoute>
                      <GestionRoles />
                    </PrivateRoute>
                  } />
                  <Route path="/calendario" element={
                    <PrivateRoute>
                      <Calendario />
                    </PrivateRoute>
                  } />
                  <Route path="/notas" element={
                    <PrivateRoute>
                      <Notas />
                    </PrivateRoute>
                  } />
                  <Route path="/producto/:id" element={<ProductoDetalle />} />
                  
                  {/* Rutas de cliente */}
                  <Route path="/carrito" element={
                    <PrivateRoute>
                      <Carrito />
                    </PrivateRoute>
                  } />
                  <Route path="/mis-compras" element={
                    <PrivateRoute>
                      <MisCompras />
                    </PrivateRoute>
                  } />
                  <Route path="/favoritos" element={<FavoritosRouter />} />
                  <Route path="/wishlist" element={
                    <PrivateRoute>
                      <Wishlist />
                    </PrivateRoute>
                  } />
                  <Route path="/perfil" element={
                    <PrivateRoute>
                      <Perfil />
                    </PrivateRoute>
                  } />
                  <Route path="/checkout" element={
                    <PrivateRoute>
                      <Checkout />
                    </PrivateRoute>
                  } />
                </Routes>
              <Footer />
              <ArbolNavidad />
              <FloatingContactButtons />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 