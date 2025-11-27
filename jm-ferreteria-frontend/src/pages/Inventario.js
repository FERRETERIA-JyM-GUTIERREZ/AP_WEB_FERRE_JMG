import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { debugAPI } from '../utils/debug';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import RolePermissionInfo from '../components/RolePermissionInfo';
import { getBackendBaseUrl } from '../services/api';

const Inventario = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [pagina, setPagina] = useState(1);
  const [porPagina] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCategoriaModal, setShowCategoriaModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [editandoCategoria, setEditandoCategoria] = useState(null);
  const [form, setForm] = useState({ nombre: '', descripcion: '', precio: '', stock: '', categoria_id: '', imagen: '', activo: true });
  const [categoriaForm, setCategoriaForm] = useState({ nombre: '', descripcion: '' });
  const [mostrarFormularioCategoria, setMostrarFormularioCategoria] = useState(false);
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const navigate = useNavigate();
  const { user, isAuthenticated, hasPermission, canManageInventory } = useAuth();
  const { isDarkMode, setIsDarkMode } = useTheme();

  // Forzar modo oscuro por defecto en gestión de inventario
  useEffect(() => {
    const savedTheme = localStorage.getItem('inventario_theme');
    if (savedTheme === null) {
      // Si no hay preferencia guardada para inventario, usar modo oscuro por defecto
      setIsDarkMode(true);
      localStorage.setItem('inventario_theme', 'dark');
    } else if (savedTheme === 'dark') {
      setIsDarkMode(true);
    } else {
      setIsDarkMode(false);
    }
  }, [setIsDarkMode]);

  // Validar acceso con sistema de permisos
  useEffect(() => {
    console.log('🔐 Verificando autenticación...');
    console.log('👤 Usuario actual:', user);
    console.log('🔑 Token:', localStorage.getItem('token'));
    console.log('✅ Autenticado:', isAuthenticated());
    console.log('📋 Puede ver inventario:', hasPermission('inventario.view'));
    
    if (!isAuthenticated()) {
      console.log('❌ No autenticado, redirigiendo...');
      toast.error('Debes iniciar sesión para acceder al inventario');
      navigate('/login');
      return;
    }
    
    if (!hasPermission('inventario.view')) {
      console.log('❌ Sin permisos de inventario, redirigiendo...');
      toast.error('No tienes permisos para acceder al inventario');
      navigate('/');
      return;
    }
    
    console.log('✅ Acceso autorizado al inventario');
  }, [navigate, user, isAuthenticated, hasPermission]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔄 Cargando datos del inventario...');
      
      // Cargar productos y categorías en paralelo
      const [productosResponse, categoriasResponse] = await Promise.all([
        productService.getAllProducts(),
        productService.getAllCategorias()
      ]);
      
      console.log('📦 Respuesta de productos:', productosResponse);
      console.log('📂 Respuesta de categorías:', categoriasResponse);
      
      // Procesar productos
      if (productosResponse.success) {
        setProductos(productosResponse.productos || []);
        console.log('✅ Productos cargados:', productosResponse.productos?.length || 0);
      } else {
        setProductos([]);
        console.error('❌ Error cargando productos:', productosResponse.error);
      }
      
      // Procesar categorías
      if (categoriasResponse.success) {
        setCategorias(categoriasResponse.data || []);
        console.log('✅ Categorías cargadas:', categoriasResponse.data?.length || 0);
      } else {
        setCategorias([]);
        console.error('❌ Error cargando categorías:', categoriasResponse.error);
      }
      
      // Si hay error en ambos, mostrar error general
      if (!productosResponse.success && !categoriasResponse.success) {
        setError('Error al cargar los datos del inventario');
      }
      
    } catch (err) {
      console.error('💥 Error completo al cargar datos:', err);
      console.error('📊 Detalles del error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError('Error al cargar los datos');
      setProductos([]);
      setCategorias([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtros y paginación
  const productosFiltrados = productos
    .filter(p => !busqueda || p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || (p.descripcion && p.descripcion.toLowerCase().includes(busqueda.toLowerCase())))
    .filter(p => !categoriaFiltro || p.categoria?.id === Number(categoriaFiltro));
  const totalPaginas = Math.ceil(productosFiltrados.length / porPagina);
  const productosPagina = productosFiltrados.slice((pagina - 1) * porPagina, pagina * porPagina);

  // Modal: abrir para agregar o editar
  const openModal = (producto = null) => {
    if (producto) {
      setEditando(producto.id);
      // Asegurarse de preservar la imagen original del producto
      setForm({ 
        ...producto, 
        imagen: producto.imagen || '' // Asegurar que imagen siempre tenga un valor
      });
      // Si el producto tiene imagen existente, mostrar preview
      if (producto.imagen) {
        // Si la imagen es una URL completa (Cloudinary), usarla directamente
        if (producto.imagen.startsWith('http://') || producto.imagen.startsWith('https://')) {
          setImagenPreview(producto.imagen);
        } else {
          // Si es una ruta relativa, construir URL completa
          setImagenPreview(`${getBackendBaseUrl()}/img_productos/${producto.imagen}`);
        }
      } else {
        setImagenPreview(null);
      }
      setImagenSeleccionada(null);
    } else {
      setEditando(null);
      setForm({ nombre: '', descripcion: '', precio: '', stock: '', categoria_id: '', imagen: '', activo: true });
      setImagenSeleccionada(null);
      setImagenPreview(null);
    }
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setEditando(null);
    setForm({ nombre: '', descripcion: '', precio: '', stock: '', categoria_id: '', imagen: '', activo: true });
    setImagenSeleccionada(null);
    setImagenPreview(null);
  };

  // Funciones para manejar imágenes
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor selecciona un archivo de imagen válido');
        return;
      }
      
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen debe ser menor a 5MB');
        return;
      }
      
      setImagenSeleccionada(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagenPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagenSeleccionada(null);
    setImagenPreview(null);
    // Solo limpiar la imagen del formulario si NO estamos editando
    // Si estamos editando, mantener la imagen original en el formulario
    if (!editando) {
      setForm({ ...form, imagen: '' });
    }
    // Si estamos editando y removemos la preview, restaurar la imagen original
    if (editando && form.imagen) {
      // Si la imagen es una URL completa (Cloudinary), usarla directamente
      if (form.imagen.startsWith('http://') || form.imagen.startsWith('https://')) {
        setImagenPreview(form.imagen);
      } else {
        // Si es una ruta relativa, construir URL completa
        setImagenPreview(`${getBackendBaseUrl()}/img_productos/${form.imagen}`);
      }
    }
  };

  // Modal de categorías: abrir para agregar o editar
  const openCategoriaModal = (categoria = null) => {
    if (categoria) {
      setEditandoCategoria(categoria.id);
      setCategoriaForm({ nombre: categoria.nombre, descripcion: categoria.descripcion || '' });
      setMostrarFormularioCategoria(true);
    } else {
      setEditandoCategoria(null);
      setCategoriaForm({ nombre: '', descripcion: '' });
      setMostrarFormularioCategoria(false);
    }
    setShowCategoriaModal(true);
  };

  const closeCategoriaModal = () => {
    setShowCategoriaModal(false);
    setEditandoCategoria(null);
    setCategoriaForm({ nombre: '', descripcion: '' });
    setMostrarFormularioCategoria(false);
  };

  // Guardar producto (agregar o editar)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!form.nombre || !form.precio || !form.stock || !form.categoria_id) {
      toast.error('Completa todos los campos obligatorios');
      return;
    }
    
    // Validar imagen solo para productos nuevos
    if (!editando && !imagenSeleccionada && !form.imagen) {
      toast.error('Debes seleccionar una imagen para el producto');
      return;
    }
    
    // Verificar autenticación
    if (!isAuthenticated()) {
      toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      navigate('/login');
      return;
    }
    
    try {
      let productData = { ...form };
      
      // Si hay una nueva imagen seleccionada, subirla primero
      if (imagenSeleccionada) {
        console.log('📤 Subiendo imagen...');
        const uploadRes = await productService.uploadImage(imagenSeleccionada);
        
        if (uploadRes.success) {
          productData.imagen = uploadRes.data.filename;
          console.log('✅ Imagen subida:', uploadRes.data.filename);
        } else {
          console.log('❌ Error subiendo imagen:', uploadRes.error);
          toast.error('Error al subir la imagen');
          return;
        }
      } else if (editando) {
        // Si estamos editando y NO hay nueva imagen, SIEMPRE preservar la imagen existente
        // Asegurarse de que productData.imagen tenga el valor del formulario (que viene del producto original)
        if (form.imagen) {
          productData.imagen = form.imagen;
          console.log('💾 Preservando imagen existente:', productData.imagen);
        } else {
          console.log('⚠️ No hay imagen para preservar en el formulario');
        }
      }
      
      console.log('💾 Guardando producto:', productData);
      let res;
      
      if (editando) {
        console.log('✏️ Actualizando producto...');
        res = await productService.updateProduct(productData);
      } else {
        console.log('➕ Creando nuevo producto...');
        res = await productService.createProduct(productData);
      }
      
      console.log('📦 Respuesta del servidor:', res);
      
      if (res.success) {
        console.log('✅ Producto guardado exitosamente');
        toast.success(editando ? 'Producto actualizado exitosamente' : 'Producto agregado exitosamente');
        closeModal();
        cargarDatos();
      } else {
        console.error('❌ Error al guardar:', res.error);
        toast.error(res.error || 'Error al guardar producto');
      }
    } catch (err) {
      console.error('💥 Error completo al guardar:', err);
      console.error('📊 Detalles del error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      toast.error('Error al guardar producto');
    }
  };

  // Eliminar producto
  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este producto?')) return;
    try {
      console.log('🗑️ Eliminando producto:', id);
      const res = await productService.deleteProduct(id);
      if (res.success) {
        toast.success('Producto eliminado');
        cargarDatos();
      } else {
        console.error('❌ Error al eliminar:', res.error);
        toast.error(res.error || 'Error al eliminar producto');
      }
    } catch (err) {
      console.error('💥 Error completo al eliminar:', err);
      toast.error('Error al eliminar producto');
    }
  };

  // Formatear precio
  const formatearPrecio = (precio) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(precio);

  // Guardar categoría (agregar o editar)
  const handleCategoriaSubmit = async (e) => {
    e.preventDefault();
    console.log('🔄 Intentando guardar categoría:', categoriaForm);
    
    if (!categoriaForm.nombre) {
      toast.error('El nombre de la categoría es obligatorio');
      return;
    }
    
    try {
      console.log('📤 Enviando datos al backend...');
      let res;
      if (editandoCategoria) {
        console.log('✏️ Actualizando categoría con ID:', editandoCategoria);
        res = await productService.updateCategoria({ ...categoriaForm, id: editandoCategoria });
      } else {
        console.log('➕ Creando nueva categoría');
        res = await productService.createCategoria(categoriaForm);
      }
      
      console.log('📥 Respuesta del backend:', res);
      
      if (res.success) {
        console.log('✅ Categoría guardada exitosamente');
        const mensaje = editandoCategoria 
          ? `Categoría "${categoriaForm.nombre}" actualizada exitosamente` 
          : `Categoría "${categoriaForm.nombre}" creada exitosamente`;
        toast.success(mensaje);
        closeCategoriaModal();
        cargarDatos(); // Recargar datos para actualizar la lista
      } else {
        console.error('❌ Error del backend:', res.error);
        toast.error(res.error || 'Error al guardar la categoría');
      }
    } catch (err) {
      console.error('💥 Error completo al guardar categoría:', err);
      console.error('📊 Detalles del error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      toast.error('Error de conexión al guardar la categoría');
    }
  };

  // Eliminar categoría
  const handleDeleteCategoria = async (id) => {
    // Encontrar la categoría para obtener su nombre
    const categoria = categorias.find(c => c.id === id);
    const nombreCategoria = categoria ? categoria.nombre : 'esta categoría';
    
    if (!window.confirm(`¿Seguro que deseas eliminar la categoría "${nombreCategoria}"?\n\n⚠️ Si esta categoría tiene productos asociados, no se podrá eliminar.`)) return;
    
    try {
      console.log('🗑️ Eliminando categoría con ID:', id);
      const res = await productService.deleteCategoria(id);
      console.log('📥 Respuesta del backend:', res);
      
      if (res.success) {
        console.log('✅ Categoría eliminada exitosamente');
        toast.success(`Categoría "${nombreCategoria}" eliminada exitosamente`);
        cargarDatos();
      } else {
        console.error('❌ Error del backend:', res.error);
        // Mostrar mensaje específico según el tipo de error
        if (res.error && res.error.includes('productos asociados')) {
          toast.error(`No se puede eliminar "${nombreCategoria}" porque tiene productos asociados. Primero mueve o elimina los productos de esta categoría.`);
        } else {
          toast.error(res.error || 'Error al eliminar categoría');
        }
      }
    } catch (err) {
      console.error('💥 Error completo al eliminar categoría:', err);
      console.error('📊 Detalles del error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      toast.error('Error de conexión al eliminar la categoría');
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-b-2 border-orange-500 rounded-full mx-auto mb-4"></div>
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Cargando inventario...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className={`text-xl font-semibold mb-2 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Error al cargar inventario</h2>
          <p className={isDarkMode ? 'text-red-400' : 'text-red-600'}>{error}</p>
          <button 
            onClick={cargarDatos}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-4"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-4 sm:py-6 lg:py-8 transition-colors duration-300 ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        
        {/* Información de roles y permisos */}
        <RolePermissionInfo />
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 lg:mb-8 gap-3 sm:gap-4">
          <div className="w-full sm:w-auto">
            <h1 className={`text-2xl sm:text-3xl font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Inventario de Productos</h1>
            <p className={`mt-1 sm:mt-2 text-sm sm:text-base transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Administra el inventario de tu ferretería</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            {hasPermission('inventario.create') && (
              <button onClick={() => openModal()} className="w-full sm:w-auto px-4 sm:px-6 py-2 rounded-md transition-colors flex items-center justify-center gap-2 font-semibold shadow-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm sm:text-base">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden xs:inline">Agregar Producto</span>
                <span className="xs:hidden">Agregar</span>
              </button>
            )}
            <button onClick={() => openCategoriaModal()} className="w-full sm:w-auto px-4 sm:px-6 py-2 rounded-md transition-colors flex items-center justify-center gap-2 font-semibold shadow-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 text-sm sm:text-base">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span className="hidden xs:inline">Gestionar Categorías</span>
              <span className="xs:hidden">Categorías</span>
            </button>
          </div>
        </div>
        {/* Filtros */}
        <div className={`rounded-xl shadow-xl p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6 transition-all duration-300 ${isDarkMode ? 'bg-gradient-to-br from-slate-800/95 via-slate-800/90 to-slate-800/95 border border-slate-700/50 hover:border-slate-600/70' : 'bg-white hover:shadow-lg border border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <svg className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <h3 className={`text-base sm:text-lg font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Filtros de Búsqueda</h3>
          </div>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-stretch sm:items-end">
            <div className="flex-1 w-full sm:min-w-[200px] lg:min-w-64">
              <label className={`block text-xs sm:text-sm font-semibold mb-1 sm:mb-2 transition-colors flex items-center gap-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Buscar
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  value={busqueda} 
                  onChange={e => setBusqueda(e.target.value)} 
                  placeholder="Buscar por nombre..." 
                  className={`w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${isDarkMode ? 'bg-slate-700/80 border-slate-600 text-white placeholder-gray-500 focus:ring-orange-500 focus:border-orange-500/50' : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'}`} 
                />
                <svg className={`absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <div className="w-full sm:w-auto sm:min-w-[180px] lg:min-w-48">
              <label className={`block text-xs sm:text-sm font-semibold mb-1 sm:mb-2 transition-colors flex items-center gap-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Categoría
              </label>
              <div className="relative">
                <select 
                  value={categoriaFiltro} 
                  onChange={e => setCategoriaFiltro(e.target.value)} 
                  className={`w-full pl-8 sm:pl-10 pr-8 sm:pr-10 py-2 sm:py-2.5 text-sm sm:text-base border rounded-lg appearance-none focus:outline-none focus:ring-2 transition-all duration-200 cursor-pointer ${isDarkMode ? 'bg-slate-700/80 border-slate-600 text-white focus:ring-orange-500 focus:border-orange-500/50' : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'}`}
                >
                  <option value="">Todas las categorías</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                  ))}
                </select>
                <svg className={`absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 pointer-events-none transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                <svg className={`absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 pointer-events-none transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
            </div>
            <button 
              onClick={() => { setBusqueda(''); setCategoriaFiltro(''); setPagina(1); }} 
              className={`w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-semibold text-sm sm:text-base transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-gray-600 to-gray-500 text-white hover:from-gray-500 hover:to-gray-400 border border-gray-500/50' 
                  : 'bg-gradient-to-r from-gray-600 to-gray-500 text-white hover:from-gray-500 hover:to-gray-400'
              }`}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Limpiar
            </button>
          </div>
        </div>
        {/* Tabla de productos */}
        <div className={`rounded-xl shadow-xl overflow-hidden transition-all duration-300 ${isDarkMode ? 'bg-slate-800/90 border border-slate-700/50 hover:border-slate-600' : 'bg-white hover:shadow-lg'}`}>
          <div className={`px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-colors ${isDarkMode ? 'border-slate-700/50' : 'border-gray-200'}`}>
            <h3 className={`text-lg sm:text-xl font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Lista de Productos ({productosFiltrados.length})</h3>
            <button 
              onClick={cargarDatos} 
              title="Recargar productos" 
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-semibold text-sm sm:text-base text-white bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582M20 20v-5h-.581M5.635 19.364A9 9 0 1 1 19.364 5.636" />
              </svg>
              Recargar
            </button>
          </div>
          <div className="overflow-x-auto -mx-3 sm:mx-0">
            <table className={`min-w-full divide-y transition-colors ${isDarkMode ? 'divide-slate-700' : 'divide-gray-200'}`}>
              <thead className={`transition-all duration-300 ${isDarkMode ? 'bg-gradient-to-r from-slate-700/80 via-slate-700/60 to-slate-700/80 border-b-2 border-slate-600/50' : 'bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 border-b-2 border-gray-200'}`}>
                <tr>
                  <th className={`px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-bold uppercase tracking-wider transition-colors ${isDarkMode ? 'text-blue-300' : 'text-gray-700'}`}>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <span className="hidden sm:inline">Producto</span>
                      <span className="sm:hidden">Prod.</span>
                    </div>
                  </th>
                  <th className={`px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-bold uppercase tracking-wider transition-colors hidden md:table-cell ${isDarkMode ? 'text-blue-300' : 'text-gray-700'}`}>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      Categoría
                    </div>
                  </th>
                  <th className={`px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-bold uppercase tracking-wider transition-colors ${isDarkMode ? 'text-blue-300' : 'text-gray-700'}`}>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Precio
                    </div>
                  </th>
                  <th className={`px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-bold uppercase tracking-wider transition-colors ${isDarkMode ? 'text-blue-300' : 'text-gray-700'}`}>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      Stock
                    </div>
                  </th>
                  <th className={`px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-bold uppercase tracking-wider transition-colors hidden sm:table-cell ${isDarkMode ? 'text-blue-300' : 'text-gray-700'}`}>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Estado
                    </div>
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider transition-colors ${isDarkMode ? 'text-blue-300' : 'text-gray-700'}`}>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="hidden sm:inline">Acciones</span>
                      <span className="sm:hidden">Acc.</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y transition-colors ${isDarkMode ? 'divide-slate-700' : 'divide-gray-200'}`}>
                {productosPagina.map((producto, idx) => (
                  <tr 
                    key={producto.id} 
                    className={`transition-colors ${isDarkMode 
                      ? idx % 2 === 0 ? 'bg-slate-800 hover:bg-slate-750' : 'bg-slate-800/50 hover:bg-slate-750' 
                      : idx % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                      <div className={`text-sm sm:text-base font-semibold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{producto.nombre}</div>
                      {producto.descripcion && <div className={`text-xs truncate max-w-[150px] sm:max-w-xs transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{producto.descripcion}</div>}
                      {/* Mostrar categoría en móvil */}
                      <div className="md:hidden mt-1">
                        <span className={`text-xs font-semibold transition-colors ${isDarkMode ? 'text-cyan-400' : 'text-cyan-700'}`}>{producto.categoria?.nombre || 'Sin categoría'}</span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 hidden md:table-cell">
                      <span className={`font-semibold transition-colors ${isDarkMode ? 'text-cyan-400' : 'text-cyan-700'}`}>{producto.categoria?.nombre || 'Sin categoría'}</span>
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                      <span className={`text-xs sm:text-sm font-semibold transition-colors ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>{formatearPrecio(producto.precio)}</span>
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                      <span className={`text-xs sm:text-sm font-semibold transition-colors ${
                        producto.stock > 10 
                          ? isDarkMode ? 'text-green-400' : 'text-green-600' 
                          : producto.stock > 0 
                            ? isDarkMode ? 'text-yellow-400' : 'text-yellow-600' 
                            : isDarkMode ? 'text-red-400' : 'text-red-600'
                      }`}>{producto.stock}</span>
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 hidden sm:table-cell">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full transition-colors ${
                        producto.activo 
                          ? isDarkMode ? 'bg-green-900/30 text-green-300 border border-green-700' : 'bg-green-100 text-green-800'
                          : isDarkMode ? 'bg-red-900/30 text-red-300 border border-red-700' : 'bg-red-100 text-red-800'
                      }`}>{producto.activo ? 'Activo' : 'Inactivo'}</span>
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium">
                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                        {hasPermission('inventario.update') && (
                          <button
                            onClick={() => openModal(producto)}
                            title="Editar"
                            className={`w-full sm:w-auto px-2 sm:px-3 py-1.5 rounded-md font-semibold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 ${
                              isDarkMode 
                                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 hover:bg-yellow-500/30 hover:border-yellow-500/60 hover:shadow-lg hover:shadow-yellow-500/20' 
                                : 'bg-yellow-100 text-yellow-700 border border-yellow-300 hover:bg-yellow-200 hover:border-yellow-400 hover:shadow-md'
                            }`}
                          >
                            <svg className="w-4 h-4 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                            <span className="whitespace-nowrap">Editar</span>
                          </button>
                        )}
                        {hasPermission('inventario.delete') && (
                          <button
                            onClick={() => handleDelete(producto.id)}
                            title="Eliminar"
                            className={`w-full sm:w-auto px-2 sm:px-3 py-1.5 rounded-md font-semibold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 ${
                              isDarkMode 
                                ? 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30 hover:border-red-500/60 hover:shadow-lg hover:shadow-red-500/20' 
                                : 'bg-red-100 text-red-700 border border-red-300 hover:bg-red-200 hover:border-red-400 hover:shadow-md'
                            }`}
                          >
                            <svg className="w-4 h-4 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                            <span className="whitespace-nowrap">Eliminar</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="flex justify-center items-center gap-1 sm:gap-2 my-4 sm:my-6 select-none px-3 sm:px-0">
              {/* Botón Anterior */}
              <button
                onClick={() => setPagina(Math.max(1, pagina - 1))}
                disabled={pagina === 1}
                className={`flex items-center px-2 sm:px-4 py-2 rounded-lg transition-all duration-200 font-medium text-xs sm:text-sm border ${
                  pagina === 1 
                    ? isDarkMode 
                      ? 'bg-slate-700 text-gray-500 border-slate-600 cursor-not-allowed' 
                      : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : isDarkMode
                      ? 'bg-slate-700 text-white border-slate-600 hover:bg-slate-600 hover:border-slate-500 shadow-sm'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900 shadow-sm'
                }`}
                aria-label="Anterior"
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline">Anterior</span>
              </button>

              {/* Números de página */}
              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num, idx, arr) => {
                if (
                  num === 1 ||
                  num === totalPaginas ||
                  Math.abs(num - pagina) <= 1
                ) {
                  return (
                    <button
                      key={num}
                      onClick={() => setPagina(num)}
                      className={`px-2 sm:px-3 py-2 mx-0.5 sm:mx-1 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-200 border ${
                        pagina === num 
                          ? isDarkMode
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105'
                            : 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105'
                          : isDarkMode
                            ? 'bg-slate-700 text-white border-slate-600 hover:bg-slate-600 hover:border-slate-500 shadow-sm'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 shadow-sm'
                      }`}
                      aria-current={pagina === num ? 'page' : undefined}
                    >
                      {num}
                    </button>
                  );
                }
                if (
                  (num === pagina - 2 && pagina > 3) ||
                  (num === pagina + 2 && pagina < totalPaginas - 2)
                ) {
                  return (
                    <span key={num} className={`px-1 sm:px-2 text-xs sm:text-lg font-medium transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>…</span>
                  );
                }
                return null;
              })}

              {/* Botón Siguiente */}
              <button
                onClick={() => setPagina(Math.min(totalPaginas, pagina + 1))}
                disabled={pagina === totalPaginas}
                className={`flex items-center px-2 sm:px-4 py-2 rounded-lg transition-all duration-200 font-medium text-xs sm:text-sm border ${
                  pagina === totalPaginas 
                    ? isDarkMode
                      ? 'bg-slate-700 text-gray-500 border-slate-600 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : isDarkMode
                      ? 'bg-slate-700 text-white border-slate-600 hover:bg-slate-600 hover:border-slate-500 shadow-sm'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900 shadow-sm'
                }`}
                aria-label="Siguiente"
              >
                <span className="hidden sm:inline">Siguiente</span>
                <svg className="w-3 h-3 sm:w-4 sm:h-4 sm:ml-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
        {/* Modal agregar/editar */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
            <div className={`rounded-lg shadow-lg p-4 sm:p-6 lg:p-8 w-full max-w-md relative transition-colors max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}>
              <button className={`absolute top-2 right-2 transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-700'}`} onClick={closeModal}>&times;</button>
              <h2 className={`text-2xl font-bold mb-4 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{editando ? 'Editar Producto' : 'Agregar Producto'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Nombre *</label>
                  <input 
                    type="text" 
                    name="nombre" 
                    value={form.nombre} 
                    onChange={e => setForm({ ...form, nombre: e.target.value })} 
                    required 
                    className={`w-full border rounded px-3 py-2 transition-colors ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-gray-300'}`} 
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Descripción</label>
                  <textarea 
                    name="descripcion" 
                    value={form.descripcion} 
                    onChange={e => setForm({ ...form, descripcion: e.target.value })} 
                    className={`w-full border rounded px-3 py-2 transition-colors ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-gray-300'}`} 
                    rows="2" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Precio *</label>
                    <input 
                      type="number" 
                      name="precio" 
                      value={form.precio} 
                      onChange={e => setForm({ ...form, precio: e.target.value })} 
                      required 
                      className={`w-full border rounded px-3 py-2 transition-colors ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-gray-300'}`} 
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Stock *</label>
                    <input 
                      type="number" 
                      name="stock" 
                      value={form.stock} 
                      onChange={e => setForm({ ...form, stock: e.target.value })} 
                      required 
                      className={`w-full border rounded px-3 py-2 transition-colors ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-gray-300'}`} 
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Categoría *</label>
                  <select 
                    name="categoria_id" 
                    value={form.categoria_id} 
                    onChange={e => setForm({ ...form, categoria_id: e.target.value })} 
                    required 
                    className={`w-full border rounded px-3 py-2 transition-colors ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-gray-300'}`}
                  >
                    <option value="">Seleccionar categoría</option>
                    {categorias.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Imagen del Producto {!editando && <span className="text-red-500">*</span>}
                  </label>
                  
                  {/* Preview de la imagen */}
                  {imagenPreview && (
                    <div className="mb-3 relative">
                      <img 
                        src={imagenPreview} 
                        alt="Preview" 
                        className={`w-32 h-32 object-cover rounded border transition-colors ${isDarkMode ? 'border-slate-600' : 'border-gray-300'}`}
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                        style={{ transform: 'translate(50%, -50%)' }}
                      >
                        ×
                      </button>
                    </div>
                  )}
                  
                  {/* Selector de archivo */}
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageSelect}
                    className={`w-full border rounded px-3 py-2 transition-colors ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-gray-300'}`}
                  />
                  <p className={`text-xs mt-1 transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Formatos: JPG, PNG, GIF, JFIF, WEBP. Tamaño máximo: 5MB
                  </p>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Estado</label>
                  <select 
                    name="activo" 
                    value={form.activo ? '1' : '0'} 
                    onChange={e => setForm({ ...form, activo: e.target.value === '1' })} 
                    className={`w-full border rounded px-3 py-2 transition-colors ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-gray-300'}`}
                  >
                    <option value="1">Activo</option>
                    <option value="0">Inactivo</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <button 
                    type="button" 
                    onClick={closeModal} 
                    className={`px-4 py-2 rounded transition-colors ${isDarkMode ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 rounded bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                  >
                    {editando ? 'Guardar Cambios' : 'Agregar Producto'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Gestión de Categorías */}
        {showCategoriaModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
            <div className={`rounded-lg shadow-lg p-4 sm:p-6 lg:p-8 w-full max-w-2xl relative transition-colors max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}>
              <button className={`absolute top-2 right-2 transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-700'}`} onClick={closeCategoriaModal}>&times;</button>
              
              {mostrarFormularioCategoria ? (
                // Formulario para agregar/editar categoría
                <>
                  <h2 className={`text-2xl font-bold mb-4 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{editandoCategoria ? 'Editar Categoría' : 'Agregar Categoría'}</h2>
                  <form onSubmit={handleCategoriaSubmit} className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Nombre *</label>
                      <input 
                        type="text" 
                        name="nombre" 
                        value={categoriaForm.nombre} 
                        onChange={e => setCategoriaForm({ ...categoriaForm, nombre: e.target.value })} 
                        required 
                        className={`w-full border rounded px-3 py-2 transition-colors ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' : 'border-gray-300'}`}
                        placeholder="Ej: Herramientas Eléctricas"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Descripción</label>
                      <textarea 
                        name="descripcion" 
                        value={categoriaForm.descripcion} 
                        onChange={e => setCategoriaForm({ ...categoriaForm, descripcion: e.target.value })} 
                        className={`w-full border rounded px-3 py-2 transition-colors ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' : 'border-gray-300'}`}
                        rows="3"
                        placeholder="Descripción opcional de la categoría"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button 
                        type="button" 
                        onClick={() => setMostrarFormularioCategoria(false)} 
                        className={`px-4 py-2 rounded transition-colors ${isDarkMode ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                      >
                        Cancelar
                      </button>
                      <button 
                        type="submit" 
                        className="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                      >
                        {editandoCategoria ? 'Guardar Cambios' : 'Agregar Categoría'}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                // Lista de categorías
                <>
                  <h2 className={`text-2xl font-bold mb-4 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Gestionar Categorías</h2>
                  
                  {/* Lista de categorías existentes */}
                  <div className="mb-6">
                    <h3 className={`text-lg font-semibold mb-3 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Categorías Existentes</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {categorias.map(categoria => (
                        <div key={categoria.id} className={`flex justify-between items-center p-3 border rounded-lg transition-colors ${isDarkMode ? 'bg-slate-700/50 border-slate-600' : 'border-gray-200'}`}>
                          <div>
                            <p className={`font-medium transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{categoria.nombre}</p>
                            {categoria.descripcion && (
                              <p className={`text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{categoria.descripcion}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => openCategoriaModal(categoria)}
                              className="px-3 py-1.5 bg-yellow-500 text-gray-800 rounded hover:bg-yellow-600 text-sm transition-colors flex items-center gap-1.5"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                              </svg>
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteCategoria(categoria.id)}
                              className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 text-sm transition-colors flex items-center gap-1.5"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                              Eliminar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Botón para agregar nueva categoría */}
                  <div className="flex justify-center">
                    <button
                      onClick={() => setMostrarFormularioCategoria(true)}
                      className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center gap-2 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      Agregar Nueva Categoría
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventario;
