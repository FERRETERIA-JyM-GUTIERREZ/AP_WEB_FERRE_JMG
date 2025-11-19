import React, { useState } from 'react';
import { FaTimes, FaWhatsapp, FaEnvelope, FaUser, FaPhone, FaEnvelope as FaEmail } from 'react-icons/fa';
import toast from 'react-hot-toast';


const FormularioPedido = ({ producto, onClose }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    mensaje: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.telefono) {
      toast.error('Nombre y teléfono son obligatorios');
      return;
    }

    setLoading(true);

    try {
      // Aquí enviarías los datos al backend
      // const response = await orderService.createOrder({
      //   ...formData,
      //   productos: [producto],
      //   tipo_pedido: 'formulario'
      // });

      // Simular envío exitoso
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Pedido enviado exitosamente');
      onClose();
    } catch (error) {
      console.error('Error enviando pedido:', error);
      toast.error('Error al enviar el pedido');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = () => {
    const message = `Hola, me interesa el producto: ${producto.nombre} - Precio: S/ ${producto.precio}`;
    const whatsappUrl = `https://wa.me/573001234567?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(price);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Solicitar Producto</h2>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          {/* Información del producto */}
          <div className="producto-info">
            <div className="producto-image">
              {producto.imagen ? (
                <img src={producto.imagen} alt={producto.nombre} />
              ) : (
                <div className="producto-placeholder">
                  <FaEnvelope />
                </div>
              )}
            </div>
            <div className="producto-details">
              <h3>{producto.nombre}</h3>
              <p className="producto-precio">{formatPrice(producto.precio)}</p>
              <p className="producto-stock">Stock: {producto.stock} unidades</p>
            </div>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="pedido-form">
            <div className="form-group">
              <label htmlFor="nombre">
                <FaUser /> Nombre completo *
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="form-control"
                placeholder="Tu nombre completo"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="telefono">
                <FaPhone /> Teléfono *
              </label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className="form-control"
                placeholder="Tu número de teléfono"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">
                <FaEmail /> Email (opcional)
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-control"
                placeholder="Tu correo electrónico"
              />
            </div>

            <div className="form-group">
              <label htmlFor="mensaje">
                <FaEnvelope /> Mensaje adicional (opcional)
              </label>
              <textarea
                id="mensaje"
                name="mensaje"
                value={formData.mensaje}
                onChange={handleChange}
                className="form-control"
                placeholder="Comentarios adicionales sobre tu pedido..."
                rows="4"
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-success"
                onClick={handleWhatsApp}
              >
                <FaWhatsapp />
                Contactar por WhatsApp
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Enviando...' : 'Enviar Solicitud'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FormularioPedido; 