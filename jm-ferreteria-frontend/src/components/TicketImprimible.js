import React, { useEffect } from 'react';

const TicketImprimible = ({ venta, onClose }) => {
  const handlePrint = () => {
    if (!venta) return;
    
    // Crear una nueva ventana
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    // Crear el contenido HTML
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Ticket de Venta</title>
        <meta charset="UTF-8">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: white; 
            font-size: 12px;
            position: relative;
          }
          .ticket { 
            max-width: 400px; 
            margin: 0 auto; 
            background: white; 
            border: 1px solid #ccc;
            padding: 20px;
            position: relative;
          }
          .header { text-align: center; margin-bottom: 20px; }
          .company-info { text-align: center; margin-bottom: 20px; font-size: 12px; }
          .divider { border-top: 1px dashed #ccc; margin: 10px 0; }
          .details { margin-bottom: 20px; font-size: 12px; }
          .details div { display: flex; justify-content: space-between; margin-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 20px; }
          th, td { padding: 5px; text-align: left; border-bottom: 1px solid #eee; }
          th { font-weight: bold; }
          .total { border-top: 2px solid #000; padding-top: 10px; font-weight: bold; }
          .footer { text-align: center; font-size: 12px; margin-top: 20px; }
          .logo-container {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 10px;
          }
          .logo {
            width: 60px;
            height: 60px;
            margin-right: 15px;
            object-fit: contain;
          }
          .company-title {
            margin: 0;
            font-size: 18px;
            font-weight: bold;
          }
          .company-subtitle {
            margin: 0;
            font-size: 14px;
            color: #666;
          }
          .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 48px;
            font-weight: bold;
            color: #ff0000;
            opacity: 0.3;
            z-index: 1000;
            pointer-events: none;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
          }
          .anulado-header {
            background: #ff0000;
            color: white;
            text-align: center;
            padding: 10px;
            margin-bottom: 20px;
            font-weight: bold;
            font-size: 16px;
          }
        </style>
      </head>
      <body>
        <div class="ticket">
          ${venta.estado === 'anulada' ? '<div class="watermark">ANULADO</div>' : ''}
          
          ${venta.estado === 'anulada' ? '<div class="anulado-header">⚠️ VENTA DE PRODUCTO ANULADO ⚠️</div>' : ''}
          
          <div class="header">
            <div class="logo-container">
              <img src="/img/logo.png" alt="J&M Gutiérrez" class="logo" />
              <div>
                <h2 class="company-title">J&M GUTIERREZ E.I.R.L.</h2>
                <p class="company-subtitle">Ferretería</p>
              </div>
            </div>
          </div>
          
          <div class="company-info">
            <p><b>J&M GUTIERREZ E.I.R.L.</b></p>
            <p>RUC: 20611160012</p>
            <p>PZA SAN JOSE NRO. 0 URB. SAN JOSE</p>
            <p>(PUESTO 4 PABELLON J BASE I)</p>
            <p>PUNO - SAN ROMAN - JULIACA</p>
            <p>Tel: +51 960 604 850</p>
            <p>Email: info@ferreteria-jmg.com</p>
            <p>Horario: Lun-Sáb 8:00 AM - 6:00 PM</p>
          </div>
          
          <div class="divider"></div>
          
          <h3 style="text-align: center; margin-bottom: 20px;">TICKET DE VENTA</h3>
          
          <div class="details">
            <div><b>Ticket #:</b> <span>${venta.numero || venta.id || 'N/A'}</span></div>
            <div><b>Fecha:</b> <span>${venta.fecha ? (typeof venta.fecha === 'string' ? venta.fecha.substring(0, 16) : new Date(venta.fecha).toLocaleString('es-PE')) : new Date().toLocaleString('es-PE')}</span></div>
            <div><b>Cliente:</b> <span>${venta.cliente_nombre || venta.cliente_dni || 'Cliente General'}</span></div>
            ${venta.cliente_telefono ? `<div><b>Teléfono:</b> <span>${venta.cliente_telefono}</span></div>` : ''}
            <div><b>Vendedor:</b> <span>${venta.usuario?.name || 'Sistema'}</span></div>
            <div><b>Estado:</b> <span style="color: ${venta.estado === 'anulada' ? '#ff0000' : '#000000'}; font-weight: bold;">${venta.estado || 'completada'}</span></div>
          </div>
          
          <div class="divider"></div>
          
          <table>
            <thead>
              <tr>
                <th>PRODUCTO</th>
                <th style="text-align: right;">CANT</th>
                <th style="text-align: right;">PRECIO</th>
                <th style="text-align: right;">SUBTOTAL</th>
              </tr>
            </thead>
            <tbody>
              ${venta.detalles && venta.detalles.length > 0 ? venta.detalles.map(d => `
                <tr>
                  <td>${d.producto?.nombre || d.nombre || 'Producto'}</td>
                  <td style="text-align: right;">${d.cantidad || 1}</td>
                  <td style="text-align: right;">S/ ${d.precio_unitario ? Number(d.precio_unitario).toFixed(2) : '0.00'}</td>
                  <td style="text-align: right; font-weight: bold;">S/ ${d.subtotal ? Number(d.subtotal).toFixed(2) : '0.00'}</td>
                </tr>
              `).join('') : `
                <tr>
                  <td colspan="4" style="text-align: center; color: #666;">Sin productos registrados</td>
                </tr>
              `}
            </tbody>
          </table>
          
          <div class="total">
            <div style="display: flex; justify-content: space-between;">
              <span>TOTAL:</span>
              <span>S/ ${venta.total ? Number(venta.total).toFixed(2) : '0.00'}</span>
            </div>
          </div>
          
          ${venta.metodo_pago ? `
            <div class="details">
              <div><b>Método de Pago:</b> <span>${venta.metodo_pago}</span></div>
              ${venta.metodo_pago === 'yape' ? `
                <div style="text-align: center; margin: 10px 0; padding: 10px; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 4px;">
                  <div style="font-size: 11px;">
                    <p><b>NÚMERO YAPE:</b> +51 960 604 850</p>
                    <p><b>NOMBRE:</b> J&M GUTIERREZ E.I.R.L.</p>
                  </div>
                </div>
              ` : ''}
              ${venta.monto_pagado ? `<div><b>Monto Pagado:</b> <span>S/ ${Number(venta.monto_pagado).toFixed(2)}</span></div>` : ''}
              ${venta.vuelto !== null && venta.vuelto !== undefined && venta.vuelto > 0 ? `<div><b>Vuelto:</b> <span>S/ ${Number(venta.vuelto).toFixed(2)}</span></div>` : ''}
            </div>
          ` : ''}
          
          <div class="divider"></div>
          
          <div class="footer">
            <p><b>MÉTODOS DE PAGO ACEPTADOS:</b></p>
            <p>Efectivo • Tarjeta • Transferencia • Yape</p>
            <br>
            <p><b>GARANTÍA:</b></p>
            <p>Productos con garantía de fábrica</p>
            <p>Conserve este ticket para cambios</p>
            <br>
            <p><b>POLÍTICA DE CAMBIOS:</b></p>
            <p>• Cambios dentro de 7 días</p>
            <p>• Producto en perfecto estado</p>
            <p>• Con ticket de compra</p>
            <br>
            <p><b>¡GRACIAS POR SU COMPRA!</b></p>
            <p>Esperamos verlo pronto</p>
            <p>Síguenos en redes sociales</p>
            <p>@ferreteria_jmg</p>
            <br>
            <p>Ticket generado automáticamente</p>
            <p>ID: ${venta.id}</p>
          </div>
        </div>
        
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          };
          
          window.onafterprint = function() {
            window.close();
          };
        </script>
      </body>
      </html>
    `;
    
    // Escribir el contenido
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Imprimir automáticamente cuando se abre el componente
  useEffect(() => {
    if (venta) {
      handlePrint();
      // Cerrar el modal después de un breve delay
      setTimeout(() => {
        onClose();
      }, 100);
    }
  }, [venta]);

  if (!venta) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            {venta.estado === 'anulada' ? 'Ticket Anulado' : 'Ticket de Venta'}
          </h3>
          <p className="text-gray-600">
            Preparando impresión...
          </p>
        </div>
        
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    </div>
  );
};

export default TicketImprimible; 