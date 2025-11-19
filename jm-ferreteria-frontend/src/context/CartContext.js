import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);

  // Cargar carrito desde localStorage al iniciar
  useEffect(() => {
    console.log('🛒 CartContext: useEffect inicial ejecutado');
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        console.log('🛒 CartContext: Carrito cargado desde localStorage:', parsedCart);
        setCart(parsedCart);
        calculateTotal(parsedCart);
      } catch (error) {
        console.error('❌ CartContext: Error al cargar carrito:', error);
        localStorage.removeItem('cart');
      }
    } else {
      console.log('🛒 CartContext: No hay carrito guardado en localStorage');
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    console.log('🛒 CartContext: Guardando carrito en localStorage:', cart);
    localStorage.setItem('cart', JSON.stringify(cart));
    calculateTotal(cart);
  }, [cart]);

  const calculateTotal = (items) => {
    const sum = items.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    console.log('🛒 CartContext: Calculando total:', sum);
    setTotal(sum);
  };

  const addToCart = (product) => {
    console.log('🛒 CartContext: addToCart llamado con producto:', product);
    console.log('🛒 CartContext: Carrito actual:', cart);
    
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      console.log('🛒 CartContext: Item existente encontrado:', existingItem);
      
      if (existingItem) {
        // Si el producto ya existe, aumentar cantidad
        const updatedCart = prevCart.map(item =>
          item.id === product.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
        console.log('🛒 CartContext: Carrito actualizado (cantidad aumentada):', updatedCart);
        toast.success('Cantidad actualizada en el carrito');
        return updatedCart;
      } else {
        // Si es un producto nuevo, agregarlo
        const newItem = {
          ...product,
          cantidad: 1
        };
        const newCart = [...prevCart, newItem];
        console.log('🛒 CartContext: Carrito actualizado (nuevo producto):', newCart);
        toast.success('Producto agregado al carrito');
        return newCart;
      }
    });
  };

  const removeFromCart = (productId) => {
    console.log('🛒 CartContext: removeFromCart llamado con ID:', productId);
    setCart(prevCart => {
      const updatedCart = prevCart.filter(item => item.id !== productId);
      console.log('🛒 CartContext: Carrito después de remover:', updatedCart);
      toast.success('Producto removido del carrito');
      return updatedCart;
    });
  };

  const updateQuantity = (productId, newQuantity) => {
    console.log('🛒 CartContext: updateQuantity llamado con ID:', productId, 'cantidad:', newQuantity);
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prevCart => {
      const updatedCart = prevCart.map(item =>
        item.id === productId
          ? { ...item, cantidad: newQuantity }
          : item
      );
      console.log('🛒 CartContext: Carrito después de actualizar cantidad:', updatedCart);
      return updatedCart;
    });
  };

  const clearCart = () => {
    console.log('🛒 CartContext: clearCart llamado');
    setCart([]);
    toast.success('Carrito vaciado');
  };

  const getCartItemCount = () => {
    const count = cart.reduce((total, item) => total + item.cantidad, 0);
    console.log('🛒 CartContext: getCartItemCount retorna:', count);
    return count;
  };

  const getCartItem = (productId) => {
    return cart.find(item => item.id === productId);
  };

  const value = {
    cart,
    total,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartItemCount,
    getCartItem
  };

  console.log('🛒 CartContext: Valor del contexto:', value);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}; 