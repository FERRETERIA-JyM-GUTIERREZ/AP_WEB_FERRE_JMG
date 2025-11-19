import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Inicializar desde localStorage
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme !== null) {
        return savedTheme === 'dark';
      }
      // Si no hay preferencia guardada, verificar si hay un usuario en localStorage
      // para determinar el modo por defecto según el rol
      try {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          const user = JSON.parse(savedUser);
          // Si es admin/vendedor/empleado, modo oscuro por defecto
          if (user.rol === 'admin' || user.rol === 'vendedor' || user.rol === 'empleado') {
            return true; // Modo oscuro por defecto para personal
          }
        }
      } catch (e) {
        // Si hay error parseando, usar modo claro por defecto
      }
    }
    return false; // Por defecto claro para clientes o usuarios no autenticados
  });

  // Escuchar cambios en localStorage para sincronizar entre pestañas
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleStorageChange = (e) => {
      if (e.key === 'theme') {
        setIsDarkMode(e.newValue === 'dark');
      }
      // Si cambia el usuario, actualizar el tema según su rol
      if (e.key === 'user') {
        try {
          const user = e.newValue ? JSON.parse(e.newValue) : null;
          const savedTheme = localStorage.getItem('theme');
          // Solo actualizar si no hay preferencia guardada
          if (!savedTheme && user && (user.rol === 'admin' || user.rol === 'vendedor' || user.rol === 'empleado')) {
            setIsDarkMode(true);
          }
        } catch (e) {
          // Ignorar errores
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // También escuchar cambios locales (mismo tab)
    const checkUserChange = () => {
      try {
        const savedUser = localStorage.getItem('user');
        const savedTheme = localStorage.getItem('theme');
        if (savedUser && !savedTheme) {
          const user = JSON.parse(savedUser);
          if (user.rol === 'admin' || user.rol === 'vendedor' || user.rol === 'empleado') {
            setIsDarkMode(true);
          }
        }
      } catch (e) {
        // Ignorar errores
      }
    };

    // Verificar cada vez que se monte el componente
    checkUserChange();
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark-mode');
      document.body.style.backgroundColor = '#0f172a'; // Azul marino oscuro (slate-900)
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark-mode');
      document.body.style.backgroundColor = '#ffffff';
    }
    
    // Guardar preferencia en localStorage
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);


  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newValue = !prev;
      // Guardar inmediatamente en localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', newValue ? 'dark' : 'light');
      }
      return newValue;
    });
  };

  const value = {
    isDarkMode,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

