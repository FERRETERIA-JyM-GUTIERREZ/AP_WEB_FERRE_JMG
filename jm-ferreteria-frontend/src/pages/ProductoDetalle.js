import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const ProductoDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cantidad, setCantidad] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchProducto();
  }, [id]);

  const fetchProducto = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/productos/${id}`);
      setProducto(response.data.data);
    } catch (error) {
      console.error('Error al cargar producto:', error);
      toast.error('Error al cargar el producto');
    } finally {
      setLoading(false);
    }
  };

  const handleAgregarAlCarrito = async () => {
    if (!isAuthenticated()) {
      toast.error('Debes iniciar sesión para agregar productos al carrito');
      navigate('/login');
      return;
    }

    if (isAdding) return;
    
    setIsAdding(true);
    try {
      await addToCart({
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio || producto.precio_unitario || producto.precio_venta || 0,
        foto: producto.foto || producto.imagen,
        cantidad: cantidad
      });
      
      toast.success(`${cantidad} ${cantidad === 1 ? 'unidad' : 'unidades'} de ${producto.nombre} agregada${cantidad === 1 ? '' : 's'} al carrito`);
    } catch (error) {
      toast.error('Error al agregar al carrito');
    } finally {
      setIsAdding(false);
    }
  };

  const formatPrice = (price) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) || 0 : price;
    return `S/ ${numPrice.toFixed(2)}`;
  };

  const getOriginalPrice = () => {
    const precio = producto?.precio || producto?.precio_unitario || producto?.precio_venta || 0;
    const precioNum = typeof precio === 'string' ? parseFloat(precio) || 0 : precio;
    return precioNum * 1.2;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 pt-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 pt-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Producto no encontrado</h1>
          <button
            onClick={() => navigate('/catalogo')}
            className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors duration-200"
          >
            Volver al catálogo
          </button>
        </div>
      </div>
    );
  }

  const originalPrice = getOriginalPrice();
  const currentPrice = producto.precio || producto.precio_unitario || producto.precio_venta || 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-20">
      <div className="max-w-6xl mx-auto px-4">
        {/* Botón volver */}
        <button
          onClick={() => navigate('/catalogo')}
          className="flex items-center text-gray-600 hover:text-orange-600 mb-6 transition-colors duration-200"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver al catálogo
        </button>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Imagen del producto */}
            <div className="p-8">
              <div className="relative overflow-hidden bg-gray-50 rounded-lg">
                <img
                  src={producto.foto || producto.imagen || 'https://via.placeholder.com/500x400?text=Producto'}
                  alt={producto.nombre}
                  className="w-full h-96 object-cover"
                />
                {originalPrice > currentPrice && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white text-sm px-3 py-1 rounded-full font-medium">
                    -{Math.round(((originalPrice - currentPrice) / originalPrice) * 100)}% OFF
                  </div>
                )}
              </div>
            </div>

            {/* Información del producto */}
            <div className="p-8">
              {/* Categoría */}
              {producto.categoria?.nombre && (
                <div className="text-sm text-gray-500 mb-2">
                  Categoría: {producto.categoria.nombre}
                </div>
              )}

              {/* Nombre */}
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {producto.nombre}
              </h1>

              {/* Descripción */}
              {producto.descripcion && (
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {producto.descripcion}
                </p>
              )}

              {/* Precios */}
              <div className="mb-6">
                {originalPrice > currentPrice && (
                  <p className="text-gray-400 text-lg line-through mb-2">
                    {formatPrice(originalPrice)}
                  </p>
                )}
                <p className="text-orange-600 font-bold text-3xl">
                  {formatPrice(currentPrice)}
                </p>
              </div>

              {/* Stock */}
              {producto.stock !== undefined && (
                <div className="mb-6">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    producto.stock > 10 
                      ? 'bg-green-100 text-green-800' 
                      : producto.stock > 0 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-red-100 text-red-800'
                  }`}>
                    {producto.stock > 10 
                      ? '✅ En stock' 
                      : producto.stock > 0 
                        ? '⚠️ Stock limitado' 
                        : '❌ Sin stock'
                    }
                    {producto.stock > 0 && ` (${producto.stock} disponibles)`}
                  </span>
                </div>
              )}

              {/* Cantidad y agregar al carrito */}
              {producto.stock > 0 && (
                <div className="space-y-4">
                  {/* Selector de cantidad */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cantidad
                    </label>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                        className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors duration-200"
                      >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="text-lg font-medium text-gray-900 min-w-[3rem] text-center">
                        {cantidad}
                      </span>
                      <button
                        onClick={() => setCantidad(Math.min(producto.stock || 999, cantidad + 1))}
                        className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors duration-200"
                      >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Botón agregar al carrito */}
                  <button
                    onClick={handleAgregarAlCarrito}
                    disabled={isAdding || !isAuthenticated()}
                    className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    {isAdding ? (
                      <>
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Agregando...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                        </svg>
                        Agregar al Carrito
                      </>
                    )}
                  </button>

                  {!isAuthenticated() && (
                    <p className="text-sm text-gray-500 text-center">
                      <button
                        onClick={() => navigate('/login')}
                        className="text-orange-600 hover:text-orange-700 font-medium"
                      >
                        Inicia sesión
                      </button> para agregar productos al carrito
                    </p>
                  )}
                </div>
              )}

              {/* Información adicional */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Información del producto</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>SKU:</strong> {producto.id}</p>
                  {producto.marca && <p><strong>Marca:</strong> {producto.marca}</p>}
                  {producto.modelo && <p><strong>Modelo:</strong> {producto.modelo}</p>}
                  {producto.material && <p><strong>Material:</strong> {producto.material}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductoDetalle;












