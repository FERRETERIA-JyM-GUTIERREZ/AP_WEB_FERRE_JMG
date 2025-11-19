import React from 'react';
import { useCart } from '../context/CartContext';
import { FaTimes, FaTrash, FaMinus, FaPlus, FaWhatsapp } from 'react-icons/fa';
import toast from 'react-hot-toast';


const CarritoModal = ({ isOpen, onClose }) => {
  const { cart, total, removeFromCart, updateQuantity, clearCart } = useCart();

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleWhatsApp = () => {
    if (cart.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }

    const message = `Hola, me interesan los siguientes productos:\n\n${cart.map(item => 
      `• ${item.nombre} - Cantidad: ${item.cantidad} - Precio: $${item.precio}`
    ).join('\n')}\n\nTotal: $${total}`;
    
    const whatsappUrl = `https://wa.me/573001234567?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(price);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content carrito-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🛒 Carrito de Compras</h2>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          {cart.length === 0 ? (
            <div className="carrito-vacio">
              <div className="carrito-icon">🛒</div>
              <h3>Tu carrito está vacío</h3>
              <p>Agrega productos desde nuestro catálogo</p>
              <button className="btn btn-primary" onClick={onClose}>
                Ver Catálogo
              </button>
            </div>
          ) : (
            <>
              <div className="carrito-items">
                {cart.map(item => (
                  <div key={item.id} className="carrito-item">
                    <div className="item-image">
                      {item.imagen ? (
                        <img src={item.imagen} alt={item.nombre} />
                      ) : (
                        <div className="item-placeholder">
                          📦
                        </div>
                      )}
                    </div>
                    
                    <div className="item-details">
                      <h4>{item.nombre}</h4>
                      <p className="item-price">{formatPrice(item.precio)}</p>
                    </div>
                    
                    <div className="item-quantity">
                      <button
                        className="quantity-btn"
                        onClick={() => handleQuantityChange(item.id, item.cantidad - 1)}
                      >
                        <FaMinus />
                      </button>
                      <span className="quantity">{item.cantidad}</span>
                      <button
                        className="quantity-btn"
                        onClick={() => handleQuantityChange(item.id, item.cantidad + 1)}
                      >
                        <FaPlus />
                      </button>
                    </div>
                    
                    <div className="item-subtotal">
                      {formatPrice(item.precio * item.cantidad)}
                    </div>
                    
                    <button
                      className="remove-btn"
                      onClick={() => removeFromCart(item.id)}
                      title="Eliminar del carrito"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>

              <div className="carrito-summary">
                <div className="summary-row">
                  <span>Total ({cart.length} producto{cart.length !== 1 ? 's' : ''}):</span>
                  <span className="total-price">{formatPrice(total)}</span>
                </div>
              </div>

              <div className="carrito-actions">
                <button
                  className="btn btn-danger"
                  onClick={clearCart}
                >
                  <FaTrash />
                  Vaciar Carrito
                </button>
                
                <button
                  className="btn btn-success"
                  onClick={handleWhatsApp}
                >
                  <FaWhatsapp />
                  Contactar por WhatsApp
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarritoModal; 