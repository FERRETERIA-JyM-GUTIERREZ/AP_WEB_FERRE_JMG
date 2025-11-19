import React, { useState, useEffect, useContext } from 'react';
import { saleService, userService, orderService } from '../services/api';
import { productService } from '../services/productService';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { CartContext } from '../context/CartContext';
import ProductoCard from '../components/ProductoCard';
import CarritoModal from '../components/CarritoModal';
import FormularioPedido from '../components/FormularioPedido';
import TicketImprimible from '../components/TicketImprimible';
import RolePermissionInfo from '../components/RolePermissionInfo';
import dniService from '../services/dniService';

const Ventas = () => {
  const { user, isAdmin, isVendedor, hasPermission, canViewReports } = useAuth();
  const { isDarkMode } = useTheme();
  
  // Estados para ventas
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFrequent, setShowFrequent] = useState(false);
  const [frequentClients, setFrequentClients] = useState([]);
  const [loadingFrequent, setLoadingFrequent] = useState(false);
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [errorStats, setErrorStats] = useState(null);
  
  // Estados para pedidos
  const [pedidos, setPedidos] = useState([]);
  const [loadingPedidos, setLoadingPedidos] = useState(true);
  const [errorPedidos, setErrorPedidos] = useState(null);
  const [activeTab, setActiveTab] = useState('ventas');
  const [showNewSale, setShowNewSale] = useState(false);
  const [clientInput, setClientInput] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientDni, setClientDni] = useState('');
  const [clientSuggestions, setClientSuggestions] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchingDni, setSearchingDni] = useState(false);
  const [productInput, setProductInput] = useState('');
  const [productSuggestions, setProductSuggestions] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [savingSale, setSavingSale] = useState(false);
  const [saleError, setSaleError] = useState(null);
  const [saleValidation, setSaleValidation] = useState({});
  const [saleSuccess, setSaleSuccess] = useState(false);
  const [modalFade, setModalFade] = useState(false);
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [filteredVentas, setFilteredVentas] = useState([]);
  const [isFiltering, setIsFiltering] = useState(false);
  // Estado para modal de detalles e impresión
  const [showDetail, setShowDetail] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [showPrint, setShowPrint] = useState(false);
  // Estados para método de pago y vuelto
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [montoPagado, setMontoPagado] = useState('');
  const [vuelto, setVuelto] = useState(0);

  const formatCurrency = (value) => {
    const numericValue = Number(
      typeof value === 'string' ? value.replace(/[^\d.-]/g, '') : value
    );

    if (Number.isNaN(numericValue)) {
      return 'S/ 0.00';
    }

    return `S/ ${numericValue.toLocaleString('es-PE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const parseMonto = (valor) => {
    if (valor === null || valor === undefined) return 0;
    if (typeof valor === 'number') return valor;
    if (typeof valor === 'string') {
      const cleaned = valor.replace(/[^\d.-]/g, '');
      const parsed = Number(cleaned);
      return Number.isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  const getFechaIso = (fecha) => {
    if (!fecha) return null;
    if (typeof fecha === 'string') {
      return fecha.substring(0, 10);
    }
    const dateObj = new Date(fecha);
    if (Number.isNaN(dateObj.getTime())) {
      return null;
    }
    return dateObj.toISOString().substring(0, 10);
  };
  // Nuevo estado para todos los clientes frecuentes
  const [clientSuggestionsAll, setClientSuggestionsAll] = useState([]);
  const [showAnularModal, setShowAnularModal] = useState(false);
  const [anularMotivo, setAnularMotivo] = useState('');
  const [anularVentaSeleccionada, setAnularVentaSeleccionada] = useState(null);
  const [anularError, setAnularError] = useState('');
  const [anularSuccess, setAnularSuccess] = useState('');
  const [showProductosTop, setShowProductosTop] = useState(false);
  const [productosMasVendidos, setProductosMasVendidos] = useState([]);
  const [loadingProductosTop, setLoadingProductosTop] = useState(false);
  const [errorProductosTop, setErrorProductosTop] = useState('');
  // Estados para modal de ver pedido
  const [showVerPedido, setShowVerPedido] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [convertendoPedido, setConvertendoPedido] = useState(false);

  // Validación profesional de campos obligatorios
  const validateSale = () => {
    const errors = {};
    // Nombre y apellido: al menos dos palabras
    if (!clientInput || clientInput.trim().split(' ').length < 2) {
      errors.clientInput = 'Ingrese nombre y apellido del cliente';
    }
    // Teléfono opcional - si se ingresa debe ser válido
    if (clientPhone && clientPhone.trim().length > 0 && clientPhone.trim().length < 6) {
      errors.clientPhone = 'Si ingresa un teléfono, debe ser válido (mínimo 6 dígitos)';
    }
    // DNI opcional - si se ingresa debe ser válido
    if (clientDni && clientDni.length > 0 && clientDni.length !== 8) {
      errors.clientDni = 'El DNI debe tener exactamente 8 dígitos';
    }
    // Al menos un producto
    if (selectedProducts.length === 0) {
      errors.products = 'Debe seleccionar al menos un producto';
    }
    // Todas las cantidades mayores a 0
    selectedProducts.forEach((p, idx) => {
      if (!p.cantidad || p.cantidad < 1) {
        errors[`product_${p.id}`] = `La cantidad de "${p.nombre}" debe ser mayor a 0`;
      }
    });
    // Validar método de pago
    if (!metodoPago) {
      errors.metodoPago = 'Seleccione un método de pago';
    }
    // Validar monto pagado
    const total = selectedProducts.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
    if (!montoPagado || parseFloat(montoPagado) < total) {
      errors.montoPagado = `El monto pagado debe ser al menos S/ ${total.toFixed(2)}`;
    }
    setSaleValidation(errors);
    return Object.keys(errors).length === 0;
  };

  // Guardar venta (con validación y feedback)
  const saveSale = async () => {
    setSaleError(null);
    if (!validateSale()) return;
    setSavingSale(true);
    try {
      const total = selectedProducts.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
      const vueltoCalculado = parseFloat(montoPagado) - total;
      
      const venta = {
        cliente_nombre: selectedClient ? selectedClient.cliente_nombre : clientInput,
        cliente_telefono: selectedClient ? selectedClient.cliente_telefono : (clientPhone && clientPhone.trim() ? clientPhone.trim() : 'S/N'),
        cliente_dni: clientDni && clientDni.trim() ? clientDni.trim() : null,
        productos: selectedProducts.map(p => ({ producto_id: p.id, cantidad: p.cantidad, precio_unitario: p.precio })),
        total: total,
        metodo_pago: metodoPago,
        monto_pagado: parseFloat(montoPagado),
        vuelto: vueltoCalculado
      };
      const res = await saleService.createSale(venta);
      if (res.data && res.data.success) {
        setSaleSuccess(true);
        setSaleValidation({});
        setTimeout(() => {
          window.location.reload(); // Recarga la página para mostrar la venta y limpiar errores
        }, 1000); // Espera 1 segundo para mostrar el mensaje de éxito
      } else {
        setSaleError(res.data && res.data.message ? res.data.message : 'Error al guardar la venta');
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setSaleError(err.response.data.message);
      } else {
        setSaleError('Error al guardar la venta');
      }
    } finally {
      setSavingSale(false);
    }
  };

  // Función para aplicar filtros
  const applyFilters = async () => {
    setIsFiltering(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('buscar', searchTerm);
      if (filterDate) params.append('fecha', filterDate);
      if (filterEstado) params.append('estado', filterEstado);

      const res = await saleService.getSales(params.toString());
      if (res.data && res.data.success) {
        setFilteredVentas(res.data.data || []);
      } else {
        setFilteredVentas([]);
      }
    } catch (err) {
      console.error('Error al filtrar ventas:', err);
      setFilteredVentas([]);
    } finally {
      setIsFiltering(false);
    }
  };

  // Función para limpiar filtros
  const clearFilters = async () => {
    setSearchTerm('');
    setFilterDate('');
    setFilterEstado('');
    setFilteredVentas([]);
    setIsFiltering(true);
    try {
      const res = await saleService.getSales();
      if (res.data && res.data.success) {
        setFilteredVentas([]); // Mostrará todas las ventas
        setVentas(res.data.data || []);
      }
    } catch (err) {
      // No hacer nada especial
    } finally {
      setIsFiltering(false);
    }
  };

  // Usar ventas filtradas o todas las ventas
  const displayVentas = filteredVentas.length > 0 ? filteredVentas : ventas;
  const totalUnidadesProductosTop = productosMasVendidos.reduce((acc, prod) => acc + Number(prod.unidades_vendidas || 0), 0);
  const totalGeneradoProductosTop = productosMasVendidos.reduce((acc, prod) => acc + Number(prod.total_generado || 0), 0);
  const promedioPrecioProductosTop = totalUnidadesProductosTop > 0 ? totalGeneradoProductosTop / totalUnidadesProductosTop : 0;
  const topProductoDestacado = productosMasVendidos[0];
  const pedidosPendientes = pedidos.filter((p) => (p.estado || '').toLowerCase() === 'pendiente').length;
  const productosTopCardClass = isDarkMode
    ? 'rounded-2xl border border-slate-700/70 bg-gradient-to-br from-slate-950/90 via-indigo-900/40 to-slate-900/85 p-4 shadow-md shadow-slate-900/50 backdrop-blur'
    : 'rounded-2xl border border-white/60 bg-gradient-to-br from-blue-100/80 via-white/90 to-emerald-100/80 p-4 shadow-sm backdrop-blur';
  const productosTopCardLabelClass = isDarkMode
    ? 'text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300/90'
    : 'text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500';
  const productosTopCardValueClass = isDarkMode
    ? 'text-lg font-semibold text-sky-200 drop-shadow-sm'
    : 'text-lg font-semibold text-slate-900';
  const productosTopCardHintClass = isDarkMode ? 'text-xs text-slate-400' : 'text-xs text-slate-500';
  const productosTopCardNumberClass = isDarkMode
    ? 'text-2xl font-bold text-emerald-200 drop-shadow-md'
    : 'text-2xl font-bold text-slate-900';
  const productosTopUnitsChipClass = isDarkMode
    ? 'inline-flex items-center gap-1 rounded-full border border-blue-400/40 bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-200 shadow-sm'
    : 'inline-flex items-center gap-1 rounded-full border border-blue-400/40 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm';
  const productosTopPriceTextClass = isDarkMode ? 'text-sm font-medium text-slate-200' : 'text-sm font-medium text-slate-600';
  const productosTopTotalTextClass = isDarkMode ? 'text-sm sm:text-base font-semibold text-emerald-400' : 'text-sm sm:text-base font-semibold text-emerald-600';
  const productosTopProductNameClass = isDarkMode
    ? 'text-sm sm:text-base font-semibold text-slate-100 group-hover:text-white transition-colors'
    : 'text-sm sm:text-base font-semibold text-slate-800 group-hover:text-slate-900 transition-colors';
  const productosTopDescriptionClass = isDarkMode ? 'mt-1 text-xs text-slate-400 truncate' : 'mt-1 text-xs text-slate-500 truncate';
  const productosTopCategoryClass = isDarkMode
    ? 'px-3 sm:px-6 py-4 align-middle text-xs font-semibold uppercase tracking-wide text-slate-400'
    : 'px-3 sm:px-6 py-4 align-middle text-xs font-semibold uppercase tracking-wide text-slate-500';
  const productosTopRowBaseClass = isDarkMode
    ? 'group odd:bg-slate-900/70 even:bg-slate-900/60 hover:bg-slate-900/40 transition-all duration-300'
    : 'group odd:bg-white/65 even:bg-white/45 hover:bg-white/80 transition-all duration-300';
  const todayIso = new Date().toISOString().substring(0, 10);
  const monthPrefix = todayIso.substring(0, 7);
  const yearPrefix = todayIso.substring(0, 4);
  const ingresosHoyCalculado = ventas.reduce((acc, venta) => {
    const fechaIso = getFechaIso(venta.fecha);
    if (fechaIso === todayIso) {
      return acc + parseMonto(venta.total);
    }
    return acc;
  }, 0);
  const ingresosMesCalculado = ventas.reduce((acc, venta) => {
    const fechaIso = getFechaIso(venta.fecha);
    if (fechaIso && fechaIso.startsWith(monthPrefix)) {
      return acc + parseMonto(venta.total);
    }
    return acc;
  }, 0);
  const ingresosAnualesCalculado = ventas.reduce((acc, venta) => {
    const fechaIso = getFechaIso(venta.fecha);
    if (fechaIso && fechaIso.startsWith(yearPrefix)) {
      return acc + parseMonto(venta.total);
    }
    return acc;
  }, 0);
  const resolvedIngresosHoy = (() => {
    const backend = parseMonto(stats?.ingresos_hoy);
    return backend > 0 ? backend : ingresosHoyCalculado;
  })();
  const resolvedIngresosMes = (() => {
    const backend = parseMonto(stats?.ingresos_mes);
    return backend > 0 ? backend : ingresosMesCalculado;
  })();
  const resolvedIngresosAnuales = (() => {
    const backend = parseMonto(stats?.ingresos_anuales);
    return backend > 0 ? backend : ingresosAnualesCalculado;
  })();
  
  // Debug: mostrar información de ventas
  console.log('🔍 Debug Ventas:', {
    ventas: ventas.length,
    filteredVentas: filteredVentas.length,
    displayVentas: displayVentas.length,
    loading,
    error
  });

  // Función para abrir modal de detalles
  const handleVerVenta = (venta) => {
    setVentaSeleccionada(venta);
    setShowDetail(true);
  };

  // Función para imprimir ticket
  const handleImprimirVenta = (venta) => {
    setVentaSeleccionada(venta);
    setShowPrint(true);
  };

  // Cargar ventas
  const loadVentas = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔄 Cargando ventas...');
      const res = await saleService.getSales();
      console.log('📦 Respuesta del backend:', res.data);
      if (res.data && res.data.success) {
        console.log('✅ Ventas cargadas:', res.data.data?.length || 0);
        setVentas(res.data.data || []);
      } else {
        console.log('❌ Error en respuesta:', res.data);
        setError('Error al cargar ventas');
      }
    } catch (err) {
      console.log('💥 Error al cargar ventas:', err);
      setError('Error al cargar ventas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVentas();
  }, []);

  // Cargar estadísticas
  const loadStats = async () => {
    setLoadingStats(true);
    setErrorStats(null);
    try {
      const res = await saleService.getStats();
      if (res.data && res.data.success) {
        console.log('📊 Estadísticas recibidas:', res.data.data);
        setStats(res.data.data);
      } else {
        setErrorStats('Error al cargar estadísticas');
      }
    } catch (err) {
      setErrorStats('Error al cargar estadísticas');
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    loadPedidos();
  }, []);

  // Cargar pedidos
  const loadPedidos = async () => {
    setLoadingPedidos(true);
    setErrorPedidos(null);
    try {
      const res = await orderService.getOrders();
      if (res.data && res.data.success) {
        setPedidos(res.data.data);
      } else {
        setErrorPedidos('Error al cargar pedidos');
      }
    } catch (err) {
      setErrorPedidos('Error al cargar pedidos');
    } finally {
      setLoadingPedidos(false);
    }
  };

  // Confirmar pedido
  // Abrir modal para ver detalles del pedido
  const abrirVerPedido = (pedido) => {
    setPedidoSeleccionado(pedido);
    setShowVerPedido(true);
  };

  // Cerrar modal de ver pedido
  const cerrarVerPedido = () => {
    setShowVerPedido(false);
    setPedidoSeleccionado(null);
  };

  // Convertir pedido a venta
  const convertirPedidoAVenta = async (pedido) => {
    if (!window.confirm('¿Deseas confirmar este pedido y crear la venta?')) return;

    setConvertendoPedido(true);
    try {
      // Calcular total desde los detalles del pedido
      const totalVenta = pedido.detalles.reduce((sum, d) => sum + ((d.precio_unitario || 0) * d.cantidad), 0);

      // Preparar datos de la venta desde el pedido
      // Para ventas por WhatsApp, usamos 'transferencia' como método (se pagará después)
      // y monto_pagado = total (así se registra la venta como completada en el sistema)
      const ventaData = {
        cliente_nombre: pedido.cliente_nombre,
        cliente_telefono: pedido.cliente_telefono,
        cliente_dni: pedido.cliente_dni || '',
        productos: pedido.detalles.map(detalle => ({
          producto_id: detalle.producto_id,
          cantidad: detalle.cantidad
        })),
        metodo_pago: 'transferencia', // Pendiente de pago por WhatsApp
        monto_pagado: totalVenta // Registramos el monto para que se genere boleta
      };

      console.log('📤 Datos enviados al backend:', ventaData);

      // Crear la venta
      const resVenta = await saleService.createSale(ventaData);
      
      console.log('📥 Respuesta del backend:', resVenta);

      if (resVenta.data && resVenta.data.success) {
        // Actualizar estado del pedido a confirmado
        const res = await orderService.updateOrderStatus(pedido.id, 'confirmado');
        
        if (res.data && res.data.success) {
          loadPedidos();
          loadVentas();
          loadStats();
          cerrarVerPedido();
          alert('✅ Pedido convertido a venta exitosamente. Ahora puedes imprimir la boleta.');
        } else {
          alert('Venta creada pero error al actualizar pedido: ' + (res.data?.message || 'Error'));
        }
      } else {
        alert('Error al crear venta: ' + (resVenta.data?.message || 'Error desconocido'));
      }
    } catch (err) {
      console.error('❌ Error:', err);
      alert('Error: ' + (err.response?.data?.message || err.response?.data?.errors || err.message || 'Error de conexión'));
    } finally {
      setConvertendoPedido(false);
    }
  };

  const confirmarPedido = (pedido) => {
    abrirVerPedido(pedido);
  };

  // Cancelar pedido
  const cancelarPedido = async (pedidoId) => {
    if (window.confirm('¿Está seguro de que desea cancelar este pedido?')) {
      try {
        const res = await orderService.updateOrderStatus(pedidoId, 'cancelado');
        if (res.data && res.data.success) {
          loadPedidos();
          alert('Pedido cancelado exitosamente.');
        } else {
          alert('Error al cancelar pedido: ' + (res.data?.message || 'Error desconocido'));
        }
      } catch (err) {
        alert('Error al cancelar pedido: ' + (err.response?.data?.message || 'Error de conexión'));
      }
    }
  };

  // Cargar productos y clientes frecuentes para autocompletar
  useEffect(() => {
    if (showNewSale) {
      productService.getAllProducts().then(res => {
        if (res.success) setAllProducts(res.productos);
      });
      userService.sugerirClientes().then(res => {
        if (res.data && res.data.success) {
          setClientSuggestionsAll(res.data.data); // Guardar todos los clientes sugeridos
          setClientSuggestions(res.data.data); // Inicializar sugerencias
        }
      });
    }
  }, [showNewSale]);

  // Función para buscar cliente por DNI
  const buscarPorDni = async () => {
    if (!clientDni || clientDni.length !== 8) {
      alert('Ingrese un DNI válido de 8 dígitos');
      return;
    }

    setSearchingDni(true);
    try {
      // Buscar directamente en la API real de RENIEC
      const resultado = await dniService.buscarPorDni(clientDni);
      if (resultado.success) {
        setSelectedClient({
          cliente_nombre: resultado.datos.nombre_completo,
          cliente_telefono: '', // Se deja vacío por defecto
          dni: resultado.datos.dni
        });
        setClientInput(resultado.datos.nombre_completo);
        alert(`✅ Datos oficiales encontrados: ${resultado.datos.nombre_completo}\n\nFuente: RENIEC`);
      } else {
        alert(`❌ ${resultado.error}\n\nEste DNI no está registrado en la base de datos oficial de RENIEC.`);
      }
    } catch (error) {
      console.error('Error al buscar DNI:', error);
      alert('Error al buscar el DNI. Verifique su conexión a internet e intente nuevamente.');
    } finally {
      setSearchingDni(false);
    }
  };

  // Autocompletar cliente
  const handleClientInput = (e) => {
    setClientInput(e.target.value);
    setSelectedClient(null);
    if (e.target.value.length > 1) {
      // Filtrar sugerencias en tiempo real
      const filtered = clientSuggestionsAll.filter(cli =>
        cli.cliente_nombre.toLowerCase().includes(e.target.value.toLowerCase())
      );
      setClientSuggestions(filtered);
    } else {
      setClientSuggestions([]);
    }
  };

  const selectClient = (cli) => {
    setSelectedClient(cli);
    setClientInput(cli.cliente_nombre);
    setClientPhone(cli.cliente_telefono || '');
    setClientDni(cli.cliente_dni || '');
    setClientSuggestions([]);
  };

  // Autocompletar producto
  const handleProductInput = (e) => {
    setProductInput(e.target.value);
    if (e.target.value.length > 1) {
      const filtered = allProducts.filter(prod =>
        prod.nombre.toLowerCase().includes(e.target.value.toLowerCase())
      );
      setProductSuggestions(filtered);
    } else {
      setProductSuggestions([]);
    }
  };
  const addProduct = (prod) => {
    setProductInput('');
    setProductSuggestions([]);
    setSelectedProducts((prev) => {
      if (prev.find(p => p.id === prod.id)) return prev;
      return [...prev, { ...prod, cantidad: 1 }];
    });
  };
  const updateProductQty = (id, qty) => {
    setSelectedProducts((prev) => prev.map(p => p.id === id ? { ...p, cantidad: qty } : p));
  };
  const removeProduct = (id) => {
    setSelectedProducts((prev) => prev.filter(p => p.id !== id));
  };

  // Calcular vuelto automáticamente
  const calcularVuelto = () => {
    const total = selectedProducts.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
    const vueltoCalculado = parseFloat(montoPagado || 0) - total;
    setVuelto(vueltoCalculado > 0 ? vueltoCalculado : 0);
  };

  // Actualizar vuelto cuando cambie monto pagado o productos
  useEffect(() => {
    calcularVuelto();
  }, [montoPagado, selectedProducts]);

  // Función para resetear campos del formulario
  const resetSaleForm = () => {
    setClientInput('');
    setClientPhone('');
    setClientDni('');
    setSelectedClient(null);
    setProductInput('');
    setSelectedProducts([]);
    setMetodoPago('efectivo');
    setMontoPagado('');
    setVuelto(0);
    setSaleError(null);
    setSaleValidation({});
    setSaleSuccess(false);
  };

  // Resetear formulario cuando se abra/cierre el modal
  useEffect(() => {
    if (!showNewSale) {
      resetSaleForm();
    }
  }, [showNewSale]);

  const openFrequentClients = async () => {
    setShowFrequent(true);
    setLoadingFrequent(true);
    try {
      const res = await userService.getFrequentClients();
      if (res.data && res.data.success) {
        setFrequentClients(res.data.data || []);
      } else {
        setFrequentClients([]);
      }
    } catch (err) {
      setFrequentClients([]);
    } finally {
      setLoadingFrequent(false);
    }
  };

  const closeFrequentClients = () => {
    setShowFrequent(false);
  };

  const fetchProductosMasVendidos = async () => {
    setLoadingProductosTop(true);
    setErrorProductosTop('');
    try {
      const response = await saleService.getProductosMasVendidos();
      if (response.data && response.data.success) {
        setProductosMasVendidos(response.data.data);
      } else {
        setErrorProductosTop(response.data && response.data.message ? response.data.message : 'Error al cargar productos');
      }
    } catch (error) {
      setErrorProductosTop('Error de conexión');
    } finally {
      setLoadingProductosTop(false);
    }
  };

  // Función para anular una venta
  const handleAnularVenta = async () => {
    setAnularError('');
    setAnularSuccess('');
    if (!anularMotivo || anularMotivo.trim().length < 5) {
      setAnularError('Por favor, describe el motivo de la anulación con más detalle (mínimo 5 caracteres).');
      return;
    }
    try {
      const res = await saleService.anularVenta(anularVentaSeleccionada.id, { motivo: anularMotivo });
      if (res.data && res.data.success) {
        setAnularSuccess('¡Venta anulada exitosamente!');
        // Refrescar ventas
        const updatedVentas = ventas.map(v => v.id === anularVentaSeleccionada.id ? { ...v, estado: 'anulada', motivo_anulacion: anularMotivo } : v);
        setVentas(updatedVentas);
        setTimeout(() => {
          setShowAnularModal(false);
          setAnularSuccess('');
        }, 1500);
      } else {
        if (res.data && res.data.message) {
          if (res.data.message.includes('Solo se pueden anular ventas dentro de las primeras 24 horas')) {
            setAnularError('Solo se pueden anular ventas dentro de las primeras 24 horas. Esta venta ya no puede ser anulada.');
          } else if (res.data.message.includes('Solo administradores y vendedores pueden anular ventas')) {
            setAnularError('Solo los administradores y vendedores pueden anular ventas.');
          } else {
            setAnularError(res.data.message);
          }
        } else {
          setAnularError('Error al anular la venta');
        }
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        if (err.response.data.message.includes('Solo se pueden anular ventas dentro de las primeras 24 horas')) {
          setAnularError('Solo se pueden anular ventas dentro de las primeras 24 horas. Esta venta ya no puede ser anulada.');
        } else if (err.response.data.message.includes('Solo administradores y vendedores pueden anular ventas')) {
          setAnularError('Solo los administradores y vendedores pueden anular ventas.');
        } else {
          setAnularError(err.response.data.message);
        }
      } else {
        setAnularError('Error al anular la venta');
      }
    }
  };

  // Función para verificar si una venta puede ser anulada (dentro de 24 horas)
  const puedeAnularVenta = (venta) => {
    if (venta.estado === 'anulada') {
      return false;
    }
    
    const fechaVenta = new Date(venta.fecha);
    const ahora = new Date();
    const diferenciaHoras = (ahora - fechaVenta) / (1000 * 60 * 60);
    
    return diferenciaHoras <= 24;
  };

  // Función para abrir el modal de anulación
  const openAnularModal = (venta) => {
    // Verificar si el usuario tiene permisos para anular ventas
    if (!hasPermission('ventas.anular')) {
      alert('No tienes permisos para anular ventas. Solicita ayuda a un administrador.');
      return;
    }
    
    // Verificar si la venta ya está anulada
    if (venta.estado === 'anulada') {
      alert('Esta venta ya ha sido anulada.');
      return;
    }
    
    // Verificar si la venta puede ser anulada (dentro de 24 horas)
    if (!puedeAnularVenta(venta)) {
      const fechaVenta = new Date(venta.fecha);
      const ahora = new Date();
      const diferenciaHoras = Math.floor((ahora - fechaVenta) / (1000 * 60 * 60));
      alert(`No se puede anular esta venta. Solo se pueden anular ventas dentro de las primeras 24 horas. Esta venta tiene ${diferenciaHoras} horas de antigüedad.`);
      return;
    }
    
    setAnularVentaSeleccionada(venta);
    setAnularMotivo('');
    setAnularError('');
    setAnularSuccess('');
    setShowAnularModal(true);
  };

  return (
    <div className={`min-h-screen py-4 sm:py-8 print:hidden transition-colors duration-300 ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`} style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Información de roles y permisos */}
        <RolePermissionInfo />
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4 gap-4">
            {/* Icono SVG */}
            <div className="p-3 bg-gradient-to-r from-orange-500 to-yellow-400 rounded-lg shadow-lg">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h1 className={`text-2xl sm:text-3xl font-bold transition-colors tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, letterSpacing: '-0.02em' }}>Gestión de Ventas</h1>
              <p className={`mt-1 sm:mt-2 text-sm sm:text-base transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400, letterSpacing: '0.01em' }}>
                Administra las ventas de tu ferretería
              </p>
            </div>
          </div>
          {/* Botones responsivos */}
          <div className="flex flex-col sm:flex-row justify-end w-full mt-6 sm:mt-10 gap-3 sm:gap-4">
            <button
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold text-base sm:text-lg shadow-lg transition-all duration-200 border ${
                isDarkMode
                  ? 'bg-rose-500 text-white border-rose-400 hover:bg-rose-400'
                  : 'bg-rose-500 text-white border-rose-300 hover:bg-rose-400'
              }`}
              style={{ minWidth: '160px', fontFamily: "'Poppins', sans-serif", fontWeight: 600, letterSpacing: '0.02em' }}
              onClick={() => {
                setShowProductosTop(true);
                fetchProductosMasVendidos();
              }}
            >
              📊 Productos Top
            </button>
            {hasPermission('ventas.create') && (
              <button
                className="px-6 sm:px-8 py-2 sm:py-3 rounded-lg bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 text-white font-semibold text-base sm:text-lg shadow-md hover:from-emerald-700 hover:via-emerald-800 hover:to-emerald-900 transition-all duration-200 border border-emerald-500"
                style={{ minWidth: '180px', fontFamily: "'Poppins', sans-serif", fontWeight: 600, letterSpacing: '0.02em' }}
                onClick={() => setShowNewSale(true)}
              >
                Nueva Venta
              </button>
            )}
          </div>
        </div>

        {/* Pestañas de navegación - Botones Vistosos */}
        <div className="mb-8">
          <div className="flex space-x-4">
            {/* Botón Ventas */}
            <button
              onClick={() => setActiveTab('ventas')}
              className={`relative px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-sm sm:text-base flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105 ${
                activeTab === 'ventas'
                  ? isDarkMode
                    ? 'bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white shadow-[0_12px_32px_rgba(59,130,246,0.5)]'
                    : 'bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400 text-white shadow-[0_12px_32px_rgba(59,130,246,0.4)]'
                  : isDarkMode
                    ? 'bg-slate-700/60 text-slate-300 hover:bg-slate-700 hover:text-slate-100'
                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300 hover:text-slate-700'
              }`}
              style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, letterSpacing: '0.01em' }}
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span>💰 Ventas</span>
              {activeTab === 'ventas' && (
                <div className="absolute inset-0 rounded-2xl bg-white/20 animate-pulse" />
              )}
            </button>

            {/* Botón Pedidos WhatsApp */}
            <button
              onClick={() => setActiveTab('pedidos')}
              className={`relative px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-sm sm:text-base flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105 ${
                activeTab === 'pedidos'
                  ? isDarkMode
                    ? 'bg-gradient-to-r from-orange-600 via-orange-500 to-red-500 text-white shadow-[0_12px_32px_rgba(249,115,22,0.5)]'
                    : 'bg-gradient-to-r from-orange-500 via-orange-400 to-red-400 text-white shadow-[0_12px_32px_rgba(249,115,22,0.4)]'
                  : isDarkMode
                    ? 'bg-slate-700/60 text-slate-300 hover:bg-slate-700 hover:text-slate-100'
                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300 hover:text-slate-700'
              }`}
              style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, letterSpacing: '0.01em' }}
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
              </svg>
              <span>📲 Pedidos</span>
              {pedidosPendientes > 0 && (
                <span
                  className={`ml-1 inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-bold transition-all duration-200 ${
                    activeTab === 'pedidos'
                      ? isDarkMode
                        ? 'border-white/40 bg-white/20 text-white shadow-[0_6px_14px_rgba(255,255,255,0.25)]'
                        : 'border-white/40 bg-white/25 text-white shadow-[0_6px_14px_rgba(255,255,255,0.25)]'
                      : isDarkMode
                        ? 'border-rose-400/60 bg-rose-500/20 text-rose-200 shadow-[0_6px_14px_rgba(244,63,94,0.25)]'
                        : 'border-rose-200 bg-rose-100 text-rose-600 shadow-[0_6px_14px_rgba(244,63,94,0.25)]'
                  }`}
                >
                  {pedidosPendientes}
                </span>
              )}
              {activeTab === 'pedidos' && (
                <div className="absolute inset-0 rounded-2xl bg-white/20 animate-pulse" />
              )}
            </button>
          </div>
        </div>

        {/* Estadísticas - Condicional según pestaña activa */}
        {activeTab === 'ventas' ? (
          // ESTADÍSTICAS DE VENTAS
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
            {/* Ventas Hoy */}
            <div className={`rounded-lg shadow-lg p-4 sm:p-6 flex flex-col items-center transition-all duration-300 hover:scale-105 ${isDarkMode ? 'bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700' : 'bg-white'}`}>
              <div className={`p-2 sm:p-3 rounded-full mb-2 shadow-lg transition-colors ${isDarkMode ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-blue-100 text-blue-600'}`}>
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
              </div>
              <span className={`text-xs sm:text-sm font-semibold mb-1 text-center transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, letterSpacing: '0.02em' }}>Ventas Hoy</span>
              <span className={`text-xl sm:text-2xl lg:text-3xl font-extrabold drop-shadow-sm transition-colors ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`} style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, letterSpacing: '-0.03em' }}>{loadingStats || errorStats ? 'No disponible' : stats?.ventas_hoy ?? 0}</span>
            </div>
            {/* Ingresos Hoy */}
            <div className={`rounded-lg shadow-lg p-4 sm:p-6 flex flex-col items-center transition-all duration-300 hover:scale-105 ${isDarkMode ? 'bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700' : 'bg-white'}`}>
              <div className={`p-2 sm:p-3 rounded-full mb-2 shadow-lg transition-colors ${isDarkMode ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-green-100 text-green-600'}`}>
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 0V4m0 16v-4" />
                  </svg>
              </div>
              <span className={`text-xs sm:text-sm font-semibold mb-1 text-center transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, letterSpacing: '0.02em' }}>Ingresos Hoy</span>
              <span className={`text-base sm:text-lg lg:text-xl font-extrabold drop-shadow-sm transition-colors ${isDarkMode ? 'text-green-400' : 'text-green-700'}`} style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, letterSpacing: '-0.03em' }}>
                {loadingStats || errorStats ? 'No disponible' : formatCurrency(resolvedIngresosHoy)}
              </span>
            </div>
            {/* Pendientes */}
            <div className={`rounded-lg shadow-lg p-4 sm:p-6 flex flex-col items-center transition-all duration-300 hover:scale-105 ${isDarkMode ? 'bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700' : 'bg-white'}`}>
              <div className={`p-2 sm:p-3 rounded-full mb-2 shadow-lg transition-colors ${isDarkMode ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-yellow-100 text-yellow-600'}`}>
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              <span className={`text-xs sm:text-sm font-semibold mb-1 text-center transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, letterSpacing: '0.02em' }}>Pendientes</span>
              <span className={`text-xl sm:text-2xl lg:text-3xl font-extrabold drop-shadow-sm transition-colors ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, letterSpacing: '-0.03em' }}>
                {loadingStats || errorStats ? 'No disponible' : stats?.pendientes ?? 0}
              </span>
            </div>
            {/* Clientes */}
            <div className={`rounded-lg shadow-lg p-4 sm:p-6 flex flex-col items-center transition-all duration-300 hover:scale-105 ${isDarkMode ? 'bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700' : 'bg-white'}`}>
              <div className={`p-2 sm:p-3 rounded-full mb-2 shadow-lg transition-colors ${isDarkMode ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-cyan-100 text-cyan-600'}`}>
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-2a4 4 0 11-8 0 4 4 0 018 0zm6 2a4 4 0 00-3-3.87" />
                </svg>
              </div>
              <span className={`text-xs sm:text-sm font-semibold mb-1 text-center transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, letterSpacing: '0.02em' }}>Clientes</span>
              <span className={`text-xl sm:text-2xl lg:text-3xl font-extrabold drop-shadow-sm transition-colors ${isDarkMode ? 'text-cyan-400' : 'text-cyan-700'}`} style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, letterSpacing: '-0.03em' }}>{loadingStats || errorStats ? 'No disponible' : stats?.clientes_unicos ?? 0}</span>
                </div>
            {/* Ventas Mes */}
            <div className={`rounded-lg shadow-lg p-4 sm:p-6 flex flex-col items-center transition-all duration-300 hover:scale-105 ${isDarkMode ? 'bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700' : 'bg-white'}`}>
              <div className={`p-2 sm:p-3 rounded-full mb-2 shadow-lg transition-colors ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-indigo-100 text-indigo-600'}`}>
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className={`text-xs sm:text-sm font-semibold mb-1 text-center transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, letterSpacing: '0.02em' }}>Ventas Mes</span>
              <span className={`text-xl sm:text-2xl lg:text-3xl font-extrabold drop-shadow-sm transition-colors ${isDarkMode ? 'text-indigo-400' : 'text-indigo-700'}`} style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, letterSpacing: '-0.03em' }}>{loadingStats || errorStats ? 'No disponible' : stats?.ventas_mes ?? 0}</span>
            </div>
            {/* Ingresos Mes */}
            <div className={`rounded-lg shadow-lg p-4 sm:p-6 flex flex-col items-center transition-all duration-300 hover:scale-105 ${isDarkMode ? 'bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700' : 'bg-white'}`}>
              <div className={`p-2 sm:p-3 rounded-full mb-2 shadow-lg transition-colors ${isDarkMode ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-100 text-emerald-600'}`}>
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect width="20" height="12" x="2" y="6" rx="2" />
                  <circle cx="12" cy="12" r="3" />
                  </svg>
                </div>
              <span className={`text-xs sm:text-sm font-semibold mb-1 text-center transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, letterSpacing: '0.02em' }}>Ingresos Mes</span>
              <span className={`text-base sm:text-lg lg:text-xl font-extrabold drop-shadow-sm transition-colors ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`} style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, letterSpacing: '-0.03em' }}>
                {loadingStats || errorStats ? 'No disponible' : formatCurrency(resolvedIngresosMes)}
              </span>
            </div>
          </div>
        ) : (
          // ESTADÍSTICAS DE PEDIDOS WHATSAPP
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
            {/* Total de Pedidos */}
            <div className={`rounded-lg shadow-lg p-4 sm:p-6 flex flex-col items-center transition-all duration-300 hover:scale-105 ${isDarkMode ? 'bg-gradient-to-br from-blue-900/40 to-blue-800/30 border border-blue-700/60' : 'bg-blue-50 border border-blue-200'}`}>
              <div className={`p-2 sm:p-3 rounded-full mb-2 shadow-lg transition-colors ${isDarkMode ? 'bg-blue-500/30 text-blue-300 border border-blue-500/50' : 'bg-blue-100 text-blue-600'}`}>
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <span className={`text-xs sm:text-sm font-semibold mb-1 text-center transition-colors ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`} style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, letterSpacing: '0.02em' }}>Total de Pedidos</span>
              <span className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold drop-shadow-sm transition-colors ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`} style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, letterSpacing: '-0.03em' }}>
                {loadingPedidos ? 'Cargando...' : pedidos.length}
              </span>
            </div>

            {/* Pedidos Pendientes */}
            <div className={`rounded-lg shadow-lg p-4 sm:p-6 flex flex-col items-center transition-all duration-300 hover:scale-105 ${isDarkMode ? 'bg-gradient-to-br from-yellow-900/40 to-yellow-800/30 border border-yellow-700/60' : 'bg-yellow-50 border border-yellow-200'}`}>
              <div className={`p-2 sm:p-3 rounded-full mb-2 shadow-lg transition-colors ${isDarkMode ? 'bg-yellow-500/30 text-yellow-300 border border-yellow-500/50' : 'bg-yellow-100 text-yellow-600'}`}>
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className={`text-xs sm:text-sm font-semibold mb-1 text-center transition-colors ${isDarkMode ? 'text-yellow-300' : 'text-yellow-700'}`} style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, letterSpacing: '0.02em' }}>Pedidos Pendientes</span>
              <span className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold drop-shadow-sm transition-colors ${isDarkMode ? 'text-yellow-300' : 'text-yellow-700'}`} style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, letterSpacing: '-0.03em' }}>
                {loadingPedidos ? 'Cargando...' : pedidos.filter(p => p.estado === 'pendiente').length}
              </span>
            </div>

            {/* Pedidos Confirmados */}
            <div className={`rounded-lg shadow-lg p-4 sm:p-6 flex flex-col items-center transition-all duration-300 hover:scale-105 ${isDarkMode ? 'bg-gradient-to-br from-green-900/40 to-green-800/30 border border-green-700/60' : 'bg-green-50 border border-green-200'}`}>
              <div className={`p-2 sm:p-3 rounded-full mb-2 shadow-lg transition-colors ${isDarkMode ? 'bg-green-500/30 text-green-300 border border-green-500/50' : 'bg-green-100 text-green-600'}`}>
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className={`text-xs sm:text-sm font-semibold mb-1 text-center transition-colors ${isDarkMode ? 'text-green-300' : 'text-green-700'}`} style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, letterSpacing: '0.02em' }}>Pedidos Confirmados</span>
              <span className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold drop-shadow-sm transition-colors ${isDarkMode ? 'text-green-300' : 'text-green-700'}`} style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, letterSpacing: '-0.03em' }}>
                {loadingPedidos ? 'Cargando...' : pedidos.filter(p => p.estado === 'confirmado').length}
              </span>
            </div>
          </div>
        )}
        
        {/* Segunda fila de estadísticas - Solo para pestaña Ventas */}
        {activeTab === 'ventas' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          {/* Ventas Anuladas */}
          <div className={`rounded-lg shadow-lg p-4 sm:p-6 flex flex-col items-center transition-all duration-300 hover:scale-105 ${isDarkMode ? 'bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700' : 'bg-white'}`}>
            <div className={`p-2 sm:p-3 rounded-full mb-2 shadow-lg transition-colors ${isDarkMode ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-red-100 text-red-600'}`}>
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
              </svg>
            </div>
            <span className={`text-xs sm:text-sm font-semibold mb-1 text-center transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, letterSpacing: '0.02em' }}>Ventas Anuladas</span>
            <span className={`text-xl sm:text-2xl lg:text-3xl font-extrabold drop-shadow-sm transition-colors ${isDarkMode ? 'text-red-400' : 'text-red-700'}`} style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, letterSpacing: '-0.03em' }}>{loadingStats || errorStats ? 'No disponible' : stats?.ventas_anuladas ?? 0}</span>
          </div>
          
          {/* Ingresos Anuales */}
          <div className={`rounded-lg shadow-lg p-4 sm:p-6 flex flex-col items-center transition-all duration-300 hover:scale-105 ${isDarkMode ? 'bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700' : 'bg-white'}`}>
            <div className={`p-2 sm:p-3 rounded-full mb-2 shadow-lg transition-colors ${isDarkMode ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-yellow-100 text-yellow-600'}`}>
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className={`text-xs sm:text-sm font-semibold mb-1 text-center transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, letterSpacing: '0.02em' }}>Ingresos Anuales</span>
            <span className={`text-base sm:text-lg lg:text-xl font-extrabold drop-shadow-sm transition-colors ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`} style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, letterSpacing: '-0.03em' }}>
              {loadingStats || errorStats ? 'No disponible' : formatCurrency(resolvedIngresosAnuales)}
            </span>
          </div>
          
          {/* Stock Bajos */}
          <div className={`rounded-lg shadow-lg p-4 sm:p-6 flex flex-col items-center transition-all duration-300 hover:scale-105 ${isDarkMode ? 'bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700' : 'bg-white'}`}>
            <div className={`p-2 sm:p-3 rounded-full mb-2 shadow-lg transition-colors ${isDarkMode ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-orange-100 text-orange-600'}`}>
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <span className={`text-xs sm:text-sm font-semibold mb-1 text-center transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, letterSpacing: '0.02em' }}>Stock Bajos (≤3)</span>
            <span className={`text-xl sm:text-2xl lg:text-3xl font-extrabold drop-shadow-sm transition-colors ${isDarkMode ? 'text-orange-400' : 'text-orange-700'}`} style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, letterSpacing: '-0.03em' }}>{loadingStats || errorStats ? 'No disponible' : stats?.stock_bajos ?? 0}</span>
          </div>
          
          {/* Productos No Vendidos */}
          <div className={`rounded-lg shadow-lg p-4 sm:p-6 flex flex-col items-center transition-all duration-300 hover:scale-105 ${isDarkMode ? 'bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700' : 'bg-white'}`}>
            <div className={`p-2 sm:p-3 rounded-full mb-2 shadow-lg transition-colors ${isDarkMode ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-purple-100 text-purple-600'}`}>
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <span className={`text-xs sm:text-sm font-semibold mb-1 text-center transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, letterSpacing: '0.02em' }}>Sin Ventas</span>
            <span className={`text-xl sm:text-2xl lg:text-3xl font-extrabold drop-shadow-sm transition-colors ${isDarkMode ? 'text-purple-400' : 'text-purple-700'}`} style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, letterSpacing: '-0.03em' }}>{loadingStats || errorStats ? 'No disponible' : stats?.productos_no_vendidos ?? 0}</span>
          </div>
          
          {/* Método de Pago Dominante */}
          <div className={`rounded-lg shadow-lg p-4 sm:p-6 flex flex-col items-center transition-all duration-300 hover:scale-105 ${isDarkMode ? 'bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700' : 'bg-white'}`}>
            <div className={`p-2 sm:p-3 rounded-full mb-2 shadow-lg transition-colors ${isDarkMode ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-green-100 text-green-600'}`}>
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <span className={`text-xs sm:text-sm font-semibold mb-1 text-center transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, letterSpacing: '0.02em' }}>Pago Favorito</span>
            <span className={`text-sm sm:text-base lg:text-lg font-bold text-center capitalize transition-colors ${isDarkMode ? 'text-green-400' : 'text-green-700'}`} style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, letterSpacing: '0.01em' }}>
              {loadingStats || errorStats ? '-' : (stats?.metodo_pago_dominante?.metodo ?? '-')}
            </span>
            {stats?.metodo_pago_dominante?.total_ventas && (
              <span className={`text-xs sm:text-sm mt-1 text-center transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {stats.metodo_pago_dominante.total_ventas} ventas
              </span>
            )}
          </div>
        </div>
        )}

        {/* Filters */}
        <div className={`rounded-xl shadow-xl p-4 sm:p-6 mb-4 sm:mb-6 transition-all duration-300 ${isDarkMode ? 'bg-gradient-to-br from-slate-800/95 via-slate-800/90 to-slate-800/95 border border-slate-700/50 hover:border-slate-600/70' : 'bg-white hover:shadow-lg border border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-4">
            <svg className={`w-5 h-5 transition-colors ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <h3 className={`text-lg font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-800'}`} style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, letterSpacing: '-0.01em' }}>Filtros de Búsqueda</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <div>
              <label className={`block text-sm font-semibold mb-2 transition-colors flex items-center gap-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`} style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, letterSpacing: '0.01em' }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Buscar
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar ventas..."
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${isDarkMode ? 'bg-slate-700/80 border-slate-600 text-white placeholder-gray-500 focus:ring-orange-500 focus:border-orange-500/50' : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'}`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <div>
              <label className={`block text-sm font-semibold mb-2 transition-colors flex items-center gap-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`} style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, letterSpacing: '0.01em' }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Fecha
              </label>
              <div className="relative">
                <input
                  type="date"
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${isDarkMode ? 'bg-slate-700/80 border-slate-600 text-white focus:ring-orange-500 focus:border-orange-500/50' : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'}`}
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                />
                <svg className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div>
              <label className={`block text-sm font-semibold mb-2 transition-colors flex items-center gap-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`} style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, letterSpacing: '0.01em' }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Estado
              </label>
              <div className="relative">
                <select 
                  className={`w-full pl-10 pr-10 py-2.5 border rounded-lg appearance-none focus:outline-none focus:ring-2 transition-all duration-200 cursor-pointer ${isDarkMode ? 'bg-slate-700/80 border-slate-600 text-white focus:ring-orange-500 focus:border-orange-500/50' : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'}`}
                  value={filterEstado}
                  onChange={(e) => setFilterEstado(e.target.value)}
                >
                  <option value="">Todos los estados</option>
                  <option value="completada">Completada</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="cancelada">Cancelada</option>
                </select>
                <svg className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                <svg className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
              <button
                onClick={applyFilters}
                disabled={isFiltering}
                className={`flex-1 px-4 sm:px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white hover:from-orange-500 hover:to-orange-400 border border-orange-500/50' 
                    : 'bg-gradient-to-r from-orange-600 to-orange-500 text-white hover:from-orange-500 hover:to-orange-400'
                }`}
                style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, letterSpacing: '0.02em' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                {isFiltering ? 'Filtrando...' : 'Filtrar'}
              </button>
              <button
                onClick={clearFilters}
                disabled={isFiltering || (!searchTerm && !filterDate && !filterEstado)}
                className={`flex-1 px-4 sm:px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-gray-600 to-gray-500 text-white hover:from-gray-500 hover:to-gray-400 border border-gray-500/50' 
                    : 'bg-gradient-to-r from-gray-600 to-gray-500 text-white hover:from-gray-500 hover:to-gray-400'
                }`}
                style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, letterSpacing: '0.02em' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Limpiar
              </button>
            </div>
          </div>
        </div>

        {/* Sales Table */}
        <div className={`rounded-lg shadow-lg overflow-hidden transition-colors ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}>
          <div className={`px-4 sm:px-6 py-3 sm:py-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-colors ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
            <h3 className={`text-base sm:text-lg font-semibold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {activeTab === 'ventas' ? `Lista de Ventas (${displayVentas.length})` : `Pedidos WhatsApp (${pedidos.length})`}
            </h3>
            <button
              onClick={openFrequentClients}
              className={`px-3 sm:px-4 py-2 rounded font-semibold shadow-lg text-sm sm:text-base transition-all duration-200 ${
                isDarkMode
                  ? 'bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 text-white hover:from-fuchsia-400 hover:via-purple-400 hover:to-indigo-400'
                  : 'bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 text-white hover:from-fuchsia-400 hover:via-purple-400 hover:to-indigo-400'
              }`}
            >
              Clientes Frecuentes
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className={`min-w-full divide-y transition-colors ${isDarkMode ? 'divide-slate-700' : 'divide-gray-200'}`}>
              <thead className={`transition-colors ${isDarkMode ? 'bg-gradient-to-r from-orange-900/30 to-orange-800/30' : 'bg-gradient-to-r from-orange-50 to-orange-100'}`}>
                <tr>
                  <th className={`px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors ${isDarkMode ? 'text-orange-400' : 'text-orange-700'}`} style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, letterSpacing: '0.05em' }}>
                    Número
                  </th>
                  <th className={`px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors ${isDarkMode ? 'text-orange-400' : 'text-orange-700'}`} style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, letterSpacing: '0.05em' }}>
                    Cliente
                  </th>
                  <th className={`px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors ${isDarkMode ? 'text-orange-400' : 'text-orange-700'}`} style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, letterSpacing: '0.05em' }}>
                    Fecha
                  </th>
                  <th className={`px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors ${isDarkMode ? 'text-orange-400' : 'text-orange-700'}`} style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, letterSpacing: '0.05em' }}>
                    Total
                  </th>
                  <th className={`px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors ${isDarkMode ? 'text-orange-400' : 'text-orange-700'}`} style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, letterSpacing: '0.05em' }}>
                    Items
                  </th>
                  <th className={`px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors ${isDarkMode ? 'text-orange-400' : 'text-orange-700'}`} style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, letterSpacing: '0.05em' }}>
                    Estado
                  </th>
                  <th className={`px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors ${isDarkMode ? 'text-orange-400' : 'text-orange-700'}`} style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, letterSpacing: '0.05em' }}>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y transition-colors ${isDarkMode ? 'bg-slate-800 divide-slate-700' : 'bg-white divide-gray-200'}`}>
                {activeTab === 'ventas' ? (
                  // Tabla de Ventas
                  loading ? (
                    <tr><td colSpan={7} className={`text-center py-6 sm:py-8 text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Cargando ventas...</td></tr>
                  ) : error ? (
                    <tr><td colSpan={7} className="text-center py-6 sm:py-8 text-red-500 text-sm">{error}</td></tr>
                  ) : displayVentas.length === 0 ? (
                    <tr><td colSpan={7} className={`text-center py-6 sm:py-8 text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>No hay ventas registradas.</td></tr>
                  ) : (
                    displayVentas.map((venta, index) => (
                  <tr 
                    key={venta.id} 
                    className={`transition-colors duration-200 ${
                      isDarkMode 
                        ? index % 2 === 0 
                          ? 'bg-slate-800 hover:bg-slate-750' 
                          : 'bg-slate-800/50 hover:bg-slate-750'
                        : index % 2 === 0 
                          ? 'bg-white hover:bg-orange-50' 
                          : 'bg-orange-25 hover:bg-orange-50'
                    }`}
                  >
                    <td className={`px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {venta.numero || venta.id}
                    </td>
                    <td className={`px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        {venta.cliente_nombre || venta.cliente || '-'}
                    </td>
                    <td className={`px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        {venta.fecha ? (typeof venta.fecha === 'string' ? venta.fecha.substring(0, 10) : new Date(venta.fecha).toLocaleDateString()) : '-'}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                      <span className={`font-semibold transition-colors ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
                        S/ {venta.total ? Number(venta.total).toFixed(2) : '0.00'}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                      {venta.detalles && venta.detalles.length > 0 ? (
                        <div className="flex flex-col space-y-1">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full transition-colors ${isDarkMode ? 'bg-purple-900/40 text-purple-300 border border-purple-700' : 'bg-purple-100 text-purple-800'}`}>
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            {venta.detalles.length} productos
                          </span>
                          <div className={`text-xs max-w-xs truncate transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {venta.detalles.slice(0, 2).map(detalle => detalle.producto?.nombre || 'Producto').join(', ')}
                            {venta.detalles.length > 2 && ` +${venta.detalles.length - 2} más`}
                          </div>
                        </div>
                      ) : (
                        <span className={`italic transition-colors ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>-</span>
                      )}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full transition-colors ${
                        venta.estado === 'completada' 
                          ? isDarkMode ? 'bg-green-900/40 text-green-300 border border-green-700' : 'bg-green-100 text-green-800'
                          : venta.estado === 'confirmado'
                          ? isDarkMode ? 'bg-blue-900/40 text-blue-300 border border-blue-700' : 'bg-blue-100 text-blue-800'
                          : venta.estado === 'pendiente'
                          ? isDarkMode ? 'bg-yellow-900/40 text-yellow-300 border border-yellow-700' : 'bg-yellow-100 text-yellow-800'
                          : venta.estado === 'anulada'
                          ? isDarkMode ? 'bg-red-900/40 text-red-300 border border-red-700' : 'bg-red-100 text-red-800'
                          : venta.estado === 'cancelada'
                          ? isDarkMode ? 'bg-red-900/40 text-red-300 border border-red-700' : 'bg-red-100 text-red-800'
                          : isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'
                      }`}>
                          {venta.estado || '-'}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                        <button 
                          onClick={() => handleVerVenta(venta)}
                          className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg font-semibold transition-all duration-200 shadow ${
                            isDarkMode 
                              ? 'bg-blue-500/20 text-blue-200 border border-blue-500/40 hover:bg-blue-500/30 hover:text-blue-100'
                              : 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 hover:text-blue-700'
                          }`}
                        >
                          Ver
                        </button>
                        <button 
                          onClick={() => handleImprimirVenta(venta)}
                          className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg font-semibold transition-all duration-200 shadow ${
                            isDarkMode 
                              ? 'bg-amber-400/20 text-amber-200 border border-amber-400/40 hover:bg-amber-400/30 hover:text-amber-100'
                              : 'bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100 hover:text-amber-700'
                          }`}
                        >
                          Imprimir
                        </button>
                        {hasPermission('ventas.anular') && puedeAnularVenta(venta) && (
                          <button
                            onClick={() => openAnularModal(venta)}
                            className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg font-semibold transition-all duration-200 shadow ${
                              isDarkMode 
                                ? 'bg-red-500/20 text-red-200 border border-red-500/40 hover:bg-red-500/30 hover:text-red-100'
                                : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:text-red-700'
                            }`}
                          >
                            Anular
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                    ))
                  )
                ) : (
                  // Tabla de Pedidos WhatsApp
                  loadingPedidos ? (
                    <tr><td colSpan={7} className={`text-center py-6 sm:py-8 text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Cargando pedidos...</td></tr>
                  ) : pedidos.length === 0 ? (
                    <tr><td colSpan={7} className={`text-center py-6 sm:py-8 text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>No hay pedidos registrados.</td></tr>
                  ) : (
                    pedidos.map((pedido, index) => (
                      <tr 
                        key={pedido.id} 
                        className={`transition-colors duration-200 ${
                          isDarkMode 
                            ? index % 2 === 0 
                              ? 'bg-slate-800 hover:bg-slate-750' 
                              : 'bg-slate-800/50 hover:bg-slate-750'
                            : index % 2 === 0 
                              ? 'bg-white hover:bg-orange-50' 
                              : 'bg-orange-25 hover:bg-orange-50'
                        }`}
                      >
                        <td className={`px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          #{pedido.id}
                        </td>
                        <td className={`px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                          {pedido.cliente_nombre || '-'}
                        </td>
                        <td className={`px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                          {pedido.fecha ? (typeof pedido.fecha === 'string' ? pedido.fecha.substring(0, 10) : new Date(pedido.fecha).toLocaleDateString()) : '-'}
                        </td>
                        <td className={`px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                          {pedido.cliente_telefono || '-'}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                          {pedido.detalles && pedido.detalles.length > 0 ? (
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full transition-colors ${isDarkMode ? 'bg-purple-900/40 text-purple-300 border border-purple-700' : 'bg-purple-100 text-purple-800'}`}>
                              {pedido.detalles.length} productos
                            </span>
                          ) : (
                            <span className={`italic transition-colors ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>-</span>
                          )}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full transition-colors ${
                            pedido.estado === 'confirmado'
                              ? isDarkMode ? 'bg-green-900/40 text-green-300 border border-green-700' : 'bg-green-100 text-green-800'
                              : pedido.estado === 'pendiente'
                              ? isDarkMode ? 'bg-yellow-900/40 text-yellow-300 border border-yellow-700' : 'bg-yellow-100 text-yellow-800'
                              : pedido.estado === 'cancelado'
                              ? isDarkMode ? 'bg-red-900/40 text-red-300 border border-red-700' : 'bg-red-100 text-red-800'
                              : isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {pedido.estado || '-'}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                            {pedido.estado === 'pendiente' && (
                              <>
                                <button 
                                  onClick={() => abrirVerPedido(pedido)}
                                  className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg font-semibold transition-all duration-200 shadow ${
                                    isDarkMode 
                                      ? 'bg-blue-500/20 text-blue-200 border border-blue-500/40 hover:bg-blue-500/30 hover:text-blue-100'
                                      : 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 hover:text-blue-700'
                                  }`}
                                >
                                  👁️ Ver
                                </button>
                                <button 
                                  onClick={() => cancelarPedido(pedido.id)}
                                  className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg font-semibold transition-all duration-200 shadow ${
                                    isDarkMode 
                                      ? 'bg-red-500/20 text-red-200 border border-red-500/40 hover:bg-red-500/30 hover:text-red-100'
                                      : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:text-red-700'
                                  }`}
                                >
                                  ✕ Anular
                                </button>
                              </>
                            )}
                            {pedido.estado !== 'pendiente' && (
                              <span className={`px-3 py-1 text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {pedido.estado === 'confirmado' ? '✓ Confirmado' : 'Completado'}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Ver Pedido (con detalles y opción de convertir a venta) */}
      {showVerPedido && pedidoSeleccionado && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-sm flex items-center justify-center z-50 px-4 py-8">
          <div className={`relative w-full max-w-2xl overflow-hidden rounded-3xl border p-6 sm:p-8 shadow-[0_30px_90px_rgba(15,23,42,0.55)] transition-all duration-300 ${
            isDarkMode
              ? 'border-slate-700/60 bg-gradient-to-br from-slate-950/95 via-slate-900/88 to-slate-850/85 text-slate-100'
              : 'border-slate-100 bg-white text-slate-900'
          }`}>
            <div className="pointer-events-none absolute -top-28 -right-24 h-64 w-64 rounded-full bg-sky-500/20 blur-[120px]" />
            <div className="pointer-events-none absolute bottom-[-6rem] left-[-3rem] h-60 w-60 rounded-full bg-amber-500/18 blur-[120px]" />
            <div className="relative z-10">
              <button
                className={`absolute top-4 right-4 text-2xl font-semibold transition-colors ${
                  isDarkMode ? 'text-slate-400 hover:text-sky-200' : 'text-slate-400 hover:text-slate-600'
                }`}
                onClick={cerrarVerPedido}
                aria-label="Cerrar"
              >
                ×
              </button>

              <h2 className={`text-2xl sm:text-3xl font-bold mb-6 tracking-tight ${isDarkMode ? 'text-sky-200 drop-shadow-[0_16px_32px_rgba(14,165,233,0.35)]' : 'text-slate-900'}`}>
                Detalles del Pedido #{pedidoSeleccionado.id}
              </h2>

              <div className="space-y-5">
                {/* Información del Cliente */}
                <div className={`rounded-2xl border p-4 ${isDarkMode ? 'border-slate-700/60 bg-slate-900/70 backdrop-blur' : 'border-slate-200 bg-slate-50'}`}>
                  <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-sky-200' : 'text-slate-900'}`}>📋 Información del Cliente</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className={`text-xs uppercase tracking-widest font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Nombre</p>
                      <p className="mt-1 font-semibold">{pedidoSeleccionado.cliente_nombre}</p>
                    </div>
                    <div>
                      <p className={`text-xs uppercase tracking-widest font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Teléfono</p>
                      <p className="mt-1 font-semibold">{pedidoSeleccionado.cliente_telefono}</p>
                    </div>
                    {pedidoSeleccionado.cliente_email && (
                      <div className="sm:col-span-2">
                        <p className={`text-xs uppercase tracking-widest font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Email</p>
                        <p className="mt-1 font-semibold">{pedidoSeleccionado.cliente_email}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Productos */}
                {pedidoSeleccionado.detalles && pedidoSeleccionado.detalles.length > 0 && (
                  <div className={`rounded-2xl border p-4 ${isDarkMode ? 'border-slate-700/60 bg-slate-900/70 backdrop-blur' : 'border-slate-200 bg-slate-50'}`}>
                    <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-sky-200' : 'text-slate-900'}`}>🛍️ Productos Pedidos</h3>
                    <div className="space-y-3">
                      {pedidoSeleccionado.detalles.map((detalle, idx) => (
                        <div key={idx} className={`p-3 rounded-lg border flex items-start gap-3 ${isDarkMode ? 'border-slate-600/40 bg-slate-800/50' : 'border-slate-200 bg-white'}`}>
                          {detalle.producto?.imagen && (
                            <img
                              src={detalle.producto.imagen}
                              alt={detalle.producto?.nombre || 'Producto'}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-semibold">{detalle.producto?.nombre || 'Producto'}</p>
                            <div className="flex justify-between items-center mt-1 text-sm">
                              <span>Cantidad: <b>{detalle.cantidad}</b></span>
                              <span>Precio: <b>{formatCurrency(detalle.precio_unitario)}</b></span>
                            </div>
                            <p className={`text-sm font-bold mt-1 ${isDarkMode ? 'text-emerald-300' : 'text-green-700'}`}>
                              Subtotal: {formatCurrency(detalle.precio_unitario * detalle.cantidad)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Total */}
                <div className={`rounded-2xl border p-4 text-center ${isDarkMode ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-emerald-200 bg-emerald-50'}`}>
                  <p className={`text-xs uppercase tracking-widest font-semibold ${isDarkMode ? 'text-emerald-300' : 'text-emerald-600'}`}>Total del Pedido</p>
                  <p className={`text-3xl font-extrabold mt-2 ${isDarkMode ? 'text-emerald-200' : 'text-emerald-700'}`}>
                    {formatCurrency(pedidoSeleccionado.detalles.reduce((sum, d) => sum + ((d.precio_unitario || 0) * d.cantidad), 0))}
                  </p>
                </div>

                {/* Botones de Acción */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-end">
                  <button
                    onClick={cerrarVerPedido}
                    className={`px-4 py-2.5 rounded-full font-semibold transition-all ${isDarkMode ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => convertirPedidoAVenta(pedidoSeleccionado)}
                    disabled={convertendoPedido}
                    className={`px-4 py-2.5 rounded-full font-semibold transition-all text-white shadow-[0_12px_32px_rgba(34,197,94,0.45)] ${
                      isDarkMode
                        ? 'bg-gradient-to-r from-emerald-500 via-green-600 to-teal-600 hover:from-emerald-400 hover:via-green-500 hover:to-teal-500 disabled:from-slate-700 disabled:to-slate-700'
                        : 'bg-gradient-to-r from-emerald-500 via-green-600 to-teal-600 hover:from-emerald-400 hover:via-green-500 hover:to-teal-500 disabled:bg-gray-400'
                    }`}
                  >
                    {convertendoPedido ? 'Procesando...' : '✓ Confirmar y Crear Venta'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Clientes Frecuentes */}
      {showFrequent && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl" onClick={closeFrequentClients}>&times;</button>
            <h2 className="text-2xl font-bold mb-4 text-cyan-800">Clientes Frecuentes</h2>
            {loadingFrequent ? (
              <div className="text-center py-8 text-gray-500">Cargando clientes frecuentes...</div>
            ) : frequentClients.length === 0 ? (
              <div className="text-center py-8 text-gray-400">No hay clientes frecuentes aún.</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-cyan-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-cyan-700 uppercase tracking-wider">Nombre</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-cyan-700 uppercase tracking-wider">Teléfono</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-cyan-700 uppercase tracking-wider">Compras</th>
                  </tr>
                </thead>
                <tbody>
                  {frequentClients.map((cli, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-cyan-50'}>
                      <td className="px-4 py-2 font-semibold text-gray-800">{cli.cliente_nombre}</td>
                      <td className="px-4 py-2 text-cyan-700">{cli.cliente_telefono}</td>
                      <td className="px-4 py-2 text-emerald-700 font-bold">{cli.compras}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
      {/* Modal Nueva Venta */}
      {showNewSale && (
        <div 
          className={`fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[100] transition-opacity duration-300 ${modalFade ? 'opacity-0' : 'opacity-100'}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setModalFade(true);
              setTimeout(() => { setShowNewSale(false); setModalFade(false); }, 350);
            }
          }}
        >
          <div 
            className={`rounded-lg shadow-lg p-8 w-full max-w-2xl relative transition-all duration-300 ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button className={`absolute top-2 right-2 text-2xl transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-700'}`} onClick={() => { setModalFade(true); setTimeout(() => { setShowNewSale(false); setModalFade(false); }, 350); }}>&times;</button>
            <h2 className={`text-2xl font-bold mb-4 transition-colors ${isDarkMode ? 'text-orange-400' : 'text-orange-700'}`}>Nueva Venta</h2>
            {saleError && (
              <div className={`mb-2 border px-4 py-2 rounded transition-colors ${isDarkMode ? 'bg-red-900/30 border-red-700 text-red-300' : 'bg-red-50 border-red-300 text-red-700'}`}>
                {saleError}
              </div>
            )}
            {saleSuccess && (
              <div className={`mb-2 border px-4 py-2 rounded flex items-center gap-2 transition-colors ${isDarkMode ? 'bg-green-900/30 border-green-700 text-green-300' : 'bg-green-50 border-green-300 text-green-700'}`}>
                <svg className={`w-5 h-5 transition-colors ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                Venta guardada con éxito
              </div>
            )}
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-1 transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Cliente <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={clientInput}
                onChange={handleClientInput}
                placeholder="Nombre y apellido..."
                className={`w-full border rounded px-3 py-2 mb-1 transition-colors ${saleValidation.clientInput ? 'border-red-400' : ''} ${isDarkMode ? 'bg-slate-700 border-slate-500 text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500' : 'border-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-orange-400 focus:border-orange-400'}`}
                autoComplete="off"
              />
              {saleValidation.clientInput && (
                <div className={`text-xs border px-2 py-1 rounded mb-1 transition-colors ${isDarkMode ? 'bg-red-900/30 border-red-700 text-red-300' : 'bg-red-50 border-red-200 text-red-500'}`}>
                  {saleValidation.clientInput}
                </div>
              )}
              {clientInput && clientSuggestions.length > 0 && (
                <div className={`border rounded shadow max-h-32 overflow-y-auto absolute z-[110] w-80 transition-colors ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-300'}`}>
                  {clientSuggestions.map((cli, idx) => (
                    <div 
                      key={idx} 
                      className={`px-3 py-2 cursor-pointer transition-colors ${isDarkMode ? 'hover:bg-slate-600 text-white' : 'hover:bg-orange-100'}`} 
                      onClick={() => selectClient(cli)}
                    >
                      {cli.cliente_nombre} <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{cli.cliente_dni ? `(DNI: ${cli.cliente_dni})` : ''} {cli.cliente_telefono ? `(${cli.cliente_telefono})` : ''}</span>
                    </div>
                  ))}
                </div>
              )}
              <input
                type="text"
                value={clientPhone}
                onChange={e => setClientPhone(e.target.value)}
                placeholder="Teléfono (opcional)"
                className={`w-full border rounded px-3 py-2 mt-2 transition-colors ${saleValidation.clientPhone ? 'border-red-400' : ''} ${isDarkMode ? 'bg-slate-700 border-slate-500 text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500' : 'border-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-orange-400 focus:border-orange-400'}`}
                autoComplete="off"
              />
              {saleValidation.clientPhone && (
                <div className={`text-xs border px-2 py-1 rounded mb-1 transition-colors ${isDarkMode ? 'bg-red-900/30 border-red-700 text-red-300' : 'bg-red-50 border-red-200 text-red-500'}`}>
                  {saleValidation.clientPhone}
                </div>
              )}
              <p className={`text-xs mt-1 transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Deje vacío si el cliente no desea proporcionar su número. Se guardará como "S/N".
              </p>
              
              {/* Campo de DNI */}
              <div className="mt-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={clientDni}
                    onChange={e => setClientDni(e.target.value)}
                    placeholder="DNI (opcional, 8 dígitos)"
                    maxLength="8"
                    className={`flex-1 border rounded px-3 py-2 transition-colors ${saleValidation.clientDni ? 'border-red-400' : ''} ${isDarkMode ? 'bg-slate-700 border-slate-500 text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500' : 'border-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-orange-400 focus:border-orange-400'}`}
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={buscarPorDni}
                    disabled={searchingDni || !clientDni || clientDni.length !== 8}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {searchingDni ? 'Buscando...' : 'Buscar DNI'}
                  </button>
                </div>
                {saleValidation.clientDni && (
                  <div className={`text-xs border px-2 py-1 rounded mt-1 transition-colors ${isDarkMode ? 'bg-red-900/30 border-red-700 text-red-300' : 'bg-red-50 border-red-200 text-red-500'}`}>
                    {saleValidation.clientDni}
                  </div>
                )}
                <p className={`text-xs mt-1 transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Ingrese el DNI del cliente para buscar datos oficiales de RENIEC y evitar duplicados
                </p>
              </div>
            </div>
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-1 transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Agregar Producto <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={productInput}
                onChange={handleProductInput}
                placeholder="Buscar producto..."
                className={`w-full border rounded px-3 py-2 mb-1 transition-colors ${isDarkMode ? 'bg-slate-700 border-slate-500 text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500' : 'border-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-orange-400 focus:border-orange-400'}`}
                autoComplete="off"
              />
              {saleValidation.products && <div className={`text-xs border px-2 py-1 rounded mb-1 transition-colors ${isDarkMode ? 'bg-red-900/30 border-red-700 text-red-300' : 'bg-red-50 border-red-200 text-red-500'}`}>{saleValidation.products}</div>}
              {productInput && productSuggestions.length > 0 && (
                <div className={`border rounded shadow max-h-32 overflow-y-auto absolute z-[110] w-80 transition-colors ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-300'}`}>
                  {productSuggestions.map((prod, idx) => (
                    <div 
                      key={prod.id} 
                      className={`px-3 py-2 cursor-pointer flex justify-between items-center transition-colors ${isDarkMode ? 'hover:bg-slate-600 text-white' : 'hover:bg-cyan-100'}`} 
                      onClick={() => addProduct(prod)}
                    >
                      <span>{prod.nombre}</span>
                      <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>S/. {prod.precio}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {selectedProducts.length > 0 && (
              <div className="mb-4">
                <h3 className={`text-lg font-semibold mb-2 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Productos Seleccionados</h3>
                <div className={`rounded-lg overflow-hidden border transition-colors ${isDarkMode ? 'border-slate-600' : 'border-gray-200'}`}>
                  <table className="min-w-full divide-y transition-colors">
                    <thead className={`transition-colors ${isDarkMode ? 'bg-slate-700/50' : 'bg-orange-50'}`}>
                      <tr>
                        <th className={`px-2 py-1 text-left text-xs font-semibold uppercase transition-colors ${isDarkMode ? 'text-orange-400' : 'text-orange-700'}`}>Producto</th>
                        <th className={`px-2 py-1 text-left text-xs font-semibold uppercase transition-colors ${isDarkMode ? 'text-orange-400' : 'text-orange-700'}`}>Precio</th>
                        <th className={`px-2 py-1 text-left text-xs font-semibold uppercase transition-colors ${isDarkMode ? 'text-orange-400' : 'text-orange-700'}`}>Cantidad</th>
                        <th className={`px-2 py-1 text-left text-xs font-semibold uppercase transition-colors ${isDarkMode ? 'text-orange-400' : 'text-orange-700'}`}>Subtotal</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y transition-colors ${isDarkMode ? 'divide-slate-700' : 'divide-gray-200'}`}>
                      {selectedProducts.map((p, idx) => (
                        <tr 
                          key={p.id} 
                          className={`transition-colors ${
                            isDarkMode 
                              ? idx % 2 === 0 ? 'bg-slate-800 hover:bg-slate-750' : 'bg-slate-800/50 hover:bg-slate-750'
                              : idx % 2 === 0 ? 'bg-white' : 'bg-orange-50'
                          }`}
                        >
                          <td className={`px-2 py-1 font-semibold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{p.nombre}</td>
                          <td className={`px-2 py-1 transition-colors ${isDarkMode ? 'text-orange-400' : 'text-orange-700'}`}>S/. {p.precio}</td>
                          <td className="px-2 py-1">
                            <input
                              type="number"
                              min={1}
                              value={p.cantidad}
                              onChange={e => updateProductQty(p.id, Number(e.target.value))}
                              className={`w-16 border rounded px-2 py-1 transition-colors ${saleValidation[`product_${p.id}`] ? 'border-red-400' : ''} ${isDarkMode ? 'bg-slate-700 border-slate-500 text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500' : 'border-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-orange-400 focus:border-orange-400'}`}
                            />
                            {saleValidation[`product_${p.id}`] && (
                              <div className={`text-xs border px-2 py-1 rounded mt-1 transition-colors ${isDarkMode ? 'bg-red-900/30 border-red-700 text-red-300' : 'bg-red-50 border-red-200 text-red-500'}`}>
                                {saleValidation[`product_${p.id}`]}
                              </div>
                            )}
                          </td>
                          <td className={`px-2 py-1 font-bold transition-colors ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>S/. {(p.precio * p.cantidad).toFixed(2)}</td>
                          <td>
                            <button 
                              onClick={() => removeProduct(p.id)} 
                              className={`font-bold transition-colors ${isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-900'}`}
                            >
                              &times;
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className={`text-right mt-2 text-lg font-bold transition-colors ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
                  Total: S/. {selectedProducts.reduce((acc, p) => acc + p.precio * p.cantidad, 0).toFixed(2)}
                </div>
              </div>
            )}
            
            {/* Campos de método de pago y vuelto */}
            {selectedProducts.length > 0 && (
              <div className={`mb-4 p-4 rounded-lg border transition-colors ${isDarkMode ? 'bg-slate-700/30 border-slate-600' : 'bg-gray-50 border-gray-200'}`}>
                <h3 className={`text-lg font-semibold mb-3 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Información de Pago</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Método de pago */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Método de Pago <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={metodoPago}
                      onChange={(e) => setMetodoPago(e.target.value)}
                      className={`w-full border rounded px-3 py-2 transition-colors ${saleValidation.metodoPago ? 'border-red-400' : ''} ${isDarkMode ? 'bg-slate-700 border-slate-500 text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500' : 'border-gray-300 focus:ring-2 focus:ring-orange-400 focus:border-orange-400'}`}
                    >
                      <option value="efectivo">Efectivo</option>
                      <option value="tarjeta">Tarjeta</option>
                      <option value="transferencia">Transferencia</option>
                      <option value="yape">Yape</option>
                    </select>
                    {saleValidation.metodoPago && (
                      <div className={`text-xs border px-2 py-1 rounded mt-1 transition-colors ${isDarkMode ? 'bg-red-900/30 border-red-700 text-red-300' : 'bg-red-50 border-red-200 text-red-500'}`}>
                        {saleValidation.metodoPago}
                      </div>
                    )}
                  </div>

                  {/* Monto pagado */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Monto Pagado <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={montoPagado}
                      onChange={(e) => setMontoPagado(e.target.value)}
                      placeholder="0.00"
                      className={`w-full border rounded px-3 py-2 transition-colors ${saleValidation.montoPagado ? 'border-red-400' : ''} ${isDarkMode ? 'bg-slate-700 border-slate-500 text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500' : 'border-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-orange-400 focus:border-orange-400'}`}
                    />
                    {saleValidation.montoPagado && (
                      <div className={`text-xs border px-2 py-1 rounded mt-1 transition-colors ${isDarkMode ? 'bg-red-900/30 border-red-700 text-red-300' : 'bg-red-50 border-red-200 text-red-500'}`}>
                        {saleValidation.montoPagado}
                      </div>
                    )}
                  </div>
                </div>

                {/* Información especial para Yape */}
                {metodoPago === 'yape' && (
                  <div className={`mt-3 p-3 rounded-lg border transition-colors ${isDarkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'}`}>
                    <div className="flex items-center mb-2">
                      <svg className={`w-5 h-5 mr-2 transition-colors ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span className={`text-sm font-semibold transition-colors ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>Información de Pago Yape</span>
                    </div>
                    <div className={`text-sm transition-colors ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>
                      <p><strong>Número Yape:</strong> +51 960 604 850</p>
                      <p><strong>Nombre:</strong> J&M GUTIERREZ E.I.R.L.</p>
                      <p className={`text-xs mt-1 transition-colors ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>El cliente debe transferir el monto exacto y mostrar el comprobante.</p>
                    </div>
                  </div>
                )}

                {/* Información del vuelto */}
                {montoPagado && parseFloat(montoPagado) > 0 && (
                  <div className={`mt-3 p-3 rounded-lg border transition-colors ${isDarkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-medium transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Total a pagar:</span>
                      <span className={`text-lg font-bold transition-colors ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
                        S/. {selectedProducts.reduce((acc, p) => acc + p.precio * p.cantidad, 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className={`text-sm font-medium transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Monto pagado:</span>
                      <span className={`text-lg font-bold transition-colors ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                        S/. {parseFloat(montoPagado || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className={`flex justify-between items-center mt-2 pt-2 border-t transition-colors ${isDarkMode ? 'border-blue-700' : 'border-blue-200'}`}>
                      <span className={`text-sm font-medium transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Vuelto:</span>
                      <span className={`text-lg font-bold transition-colors ${vuelto >= 0 ? (isDarkMode ? 'text-green-400' : 'text-green-700') : (isDarkMode ? 'text-red-400' : 'text-red-700')}`}>
                        S/. {vuelto.toFixed(2)}
                      </span>
                    </div>
                    {vuelto < 0 && (
                      <div className={`text-xs mt-1 transition-colors ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                        ⚠️ El monto pagado es insuficiente
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            <div className="flex justify-end gap-2 mt-6">
              <button 
                onClick={() => { setModalFade(true); setTimeout(() => { setShowNewSale(false); setModalFade(false); }, 350); }} 
                className={`px-4 py-2 rounded transition-colors ${isDarkMode ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                Cancelar
              </button>
              <button
                onClick={saveSale}
                disabled={
                  savingSale ||
                  !clientInput ||
                  clientInput.trim().split(' ').length < 2 ||
                  (clientPhone && clientPhone.trim().length > 0 && clientPhone.trim().length < 6) ||
                  (clientDni && clientDni.length > 0 && clientDni.length !== 8) ||
                  selectedProducts.length === 0 ||
                  selectedProducts.some(p => !p.cantidad || p.cantidad < 1) ||
                  !metodoPago ||
                  parseFloat(montoPagado) < selectedProducts.reduce((acc, p) => acc + p.precio * p.cantidad, 0)
                }
                className="px-6 py-2 rounded bg-gradient-to-r from-orange-500 via-yellow-400 to-yellow-300 text-white font-semibold shadow hover:from-orange-600 hover:via-yellow-500 hover:to-yellow-400 disabled:opacity-50 flex items-center gap-2 transition-all duration-200"
              >
                {savingSale ? (
                  <span>Guardando...</span>
                ) : saleSuccess ? (
                  <>
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    Venta guardada
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    Guardar Venta
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal de detalles de venta */}
      {showDetail && ventaSeleccionada && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div
            className={`relative w-full max-w-2xl overflow-hidden rounded-3xl border p-6 sm:p-8 shadow-2xl transition-all duration-300 ${
              isDarkMode
                ? 'border-indigo-500/20 bg-gradient-to-br from-slate-950/95 via-slate-900/90 to-slate-850/90 text-slate-100'
                : 'border-slate-100 bg-white text-slate-900'
            }`}
          >
            <div className="pointer-events-none absolute -top-24 -left-16 h-48 w-48 rounded-full bg-indigo-500/30 blur-3xl" />
            <div className="pointer-events-none absolute bottom-[-6rem] right-[-4rem] h-56 w-56 rounded-full bg-rose-500/25 blur-3xl" />
            <div className="pointer-events-none absolute top-1/2 left-[28%] h-28 w-28 rounded-full bg-emerald-400/18 blur-3xl" />

            <button
              className={`absolute top-4 right-4 text-2xl font-bold transition-colors ${
                isDarkMode ? 'text-slate-400 hover:text-emerald-200' : 'text-slate-400 hover:text-slate-600'
              }`}
              onClick={() => setShowDetail(false)}
              aria-label="Cerrar"
            >
              ×
            </button>

            {ventaSeleccionada.estado === 'anulada' && (
              <div
                style={{
                  position: 'absolute',
                  top: '42%',
                  left: '50%',
                  transform: 'translate(-50%, -50%) rotate(-15deg)',
                  fontSize: '4rem',
                  color: 'rgba(220, 38, 38, 0.2)',
                  fontWeight: 'bold',
                  pointerEvents: 'none',
                  zIndex: 10,
                }}
              >
                ANULADO
              </div>
            )}

            <h2
              className={`text-2xl sm:text-3xl font-bold mb-5 tracking-tight ${
                isDarkMode ? 'text-emerald-200 drop-shadow-[0_8px_18px_rgba(16,185,129,0.35)]' : 'text-orange-700'
              }`}
            >
              Detalle de Venta
            </h2>

            <div className={`mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
              {[
                { label: 'Número', value: ventaSeleccionada.numero || ventaSeleccionada.id, accent: 'neutral' },
                { label: 'Cliente', value: ventaSeleccionada.cliente_nombre || '-', accent: 'neutral' },
                {
                  label: 'Fecha',
                  value: ventaSeleccionada.fecha
                    ? typeof ventaSeleccionada.fecha === 'string'
                      ? ventaSeleccionada.fecha.substring(0, 10)
                      : new Date(ventaSeleccionada.fecha).toLocaleDateString()
                    : '-',
                  accent: 'neutral',
                },
                {
                  label: 'Hora',
                  value: ventaSeleccionada.fecha
                    ? typeof ventaSeleccionada.fecha === 'string'
                      ? ventaSeleccionada.fecha.substring(11, 16)
                      : new Date(ventaSeleccionada.fecha).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
                    : '-',
                  accent: 'neutral',
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`rounded-2xl border p-4 shadow-inner ${
                    isDarkMode ? 'border-slate-700/60 bg-slate-900/65 backdrop-blur' : 'border-slate-100 bg-slate-50'
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">{item.label}</p>
                  <p className="mt-1 text-lg font-bold">{item.value}</p>
                </div>
              ))}
              <div
                className={`rounded-2xl border p-4 shadow-inner sm:col-span-2 ${
                  isDarkMode ? 'border-emerald-500/30 bg-emerald-500/10 backdrop-blur' : 'border-emerald-200 bg-emerald-50'
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Total</p>
                <p className="mt-1 text-2xl font-extrabold text-emerald-400 drop-shadow">{formatCurrency(ventaSeleccionada.total)}</p>
              </div>
              <div
                className={`rounded-2xl border p-4 shadow-inner ${
                  isDarkMode ? 'border-indigo-500/30 bg-indigo-500/10 backdrop-blur' : 'border-indigo-200 bg-indigo-50'
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Estado</p>
                <span
                  className={`mt-2 inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                    ventaSeleccionada.estado === 'completada'
                      ? isDarkMode
                        ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40'
                        : 'bg-emerald-100 text-emerald-800'
                      : ventaSeleccionada.estado === 'confirmado'
                      ? isDarkMode
                        ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-500/40'
                        : 'bg-indigo-100 text-indigo-800'
                      : ventaSeleccionada.estado === 'pendiente'
                      ? isDarkMode
                        ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40'
                        : 'bg-amber-100 text-amber-800'
                      : ventaSeleccionada.estado === 'anulada'
                      ? isDarkMode
                        ? 'bg-rose-500/20 text-rose-200 border border-rose-500/40'
                        : 'bg-red-100 text-red-800'
                      : ventaSeleccionada.estado === 'cancelada'
                      ? isDarkMode
                        ? 'bg-rose-500/20 text-rose-200 border border-rose-500/40'
                        : 'bg-red-100 text-red-800'
                      : isDarkMode
                      ? 'bg-slate-500/20 text-slate-200 border border-slate-500/40'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {ventaSeleccionada.estado}
                </span>
              </div>
              <div
                className={`rounded-2xl border p-4 shadow-inner ${
                  isDarkMode ? 'border-slate-700/60 bg-slate-900/65 backdrop-blur' : 'border-slate-100 bg-slate-50'
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Vendedor</p>
                <p className="mt-1 text-lg font-bold">
                  {ventaSeleccionada.usuario?.name ? `${ventaSeleccionada.usuario.name} (${ventaSeleccionada.usuario.rol})` : 'Desconocido'}
                </p>
              </div>
            </div>

            {ventaSeleccionada.detalles && ventaSeleccionada.detalles.length > 0 && (
              <div className="mb-6">
                <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-emerald-200' : 'text-gray-800'}`}>Productos Vendidos</h3>
                <div className="overflow-x-auto rounded-2xl border border-slate-200/60">
                  <table
                    className={`min-w-full divide-y ${
                      isDarkMode ? 'divide-slate-700 bg-slate-900/60 backdrop-blur' : 'divide-gray-200 bg-white'
                    }`}
                  >
                    <thead className={isDarkMode ? 'bg-slate-900/70' : 'bg-gray-50'}>
                      <tr>
                        <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                          Producto
                        </th>
                        <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                          Cantidad
                        </th>
                        <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                          Precio Unit.
                        </th>
                        <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                          Subtotal
                        </th>
                      </tr>
                    </thead>
                    <tbody className={isDarkMode ? 'divide-y divide-slate-800' : 'divide-y divide-gray-200'}>
                      {ventaSeleccionada.detalles.map((detalle, index) => {
                        const isEven = index % 2 === 0;
                        return (
                          <tr
                            key={index}
                            className={
                              isDarkMode
                                ? isEven
                                  ? 'bg-slate-900/55'
                                  : 'bg-slate-900/35'
                                : isEven
                                ? 'bg-white'
                                : 'bg-gray-50'
                            }
                          >
                            <td className={`px-4 py-3 text-sm font-semibold ${isDarkMode ? 'text-slate-100' : 'text-gray-900'}`}>
                              {detalle.producto?.nombre || 'Producto no encontrado'}
                            </td>
                            <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-slate-200' : 'text-gray-900'}`}>{detalle.cantidad}</td>
                            <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-slate-200' : 'text-gray-900'}`}>
                              {formatCurrency(detalle.precio_unitario)}
                            </td>
                            <td className={`px-4 py-3 text-sm font-semibold ${isDarkMode ? 'text-emerald-300' : 'text-green-700'}`}>
                              {formatCurrency(detalle.subtotal)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {ventaSeleccionada.metodo_pago && (
              <div
                className={`mb-5 rounded-2xl border p-4 sm:p-5 shadow-inner ${
                  isDarkMode ? 'border-blue-500/30 bg-gradient-to-r from-blue-900/40 via-slate-900/60 to-blue-950/50' : 'border-blue-200 bg-blue-50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>Información de Pago</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      isDarkMode ? 'bg-blue-500/20 text-blue-200 border border-blue-500/40' : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {ventaSeleccionada.metodo_pago}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className={`text-xs uppercase tracking-[0.3em] font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Monto Pagado</p>
                    <p className={`text-lg font-bold mt-1 ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>
                      {formatCurrency(ventaSeleccionada.monto_pagado)}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs uppercase tracking-[0.3em] font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Vuelto</p>
                    <p className={`text-lg font-bold mt-1 ${isDarkMode ? 'text-emerald-200' : 'text-green-700'}`}>
                      {formatCurrency(ventaSeleccionada.vuelto)}
                    </p>
                    {ventaSeleccionada.metodo_pago === 'yape' && (
                      <p className={`text-xs mt-2 ${isDarkMode ? 'text-blue-200' : 'text-blue-600'}`}>
                        <b>Yape:</b> +51 960 604 850
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {ventaSeleccionada.estado === 'anulada' && (
              <div
                className={`mb-4 p-4 rounded-2xl border ${
                  isDarkMode ? 'border-rose-500/40 bg-rose-500/10' : 'bg-red-50 border-red-200'
                }`}
              >
                <p className={`font-bold mb-1 ${isDarkMode ? 'text-rose-200' : 'text-red-700'}`}>Motivo de anulación:</p>
                <p className={`italic mb-2 ${isDarkMode ? 'text-rose-100' : 'text-red-800'}`}>
                  {ventaSeleccionada.motivo_anulacion || 'Sin motivo registrado'}
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-rose-300' : 'text-red-600'}`}>
                  Anulado por: {ventaSeleccionada.anulador?.name ? `${ventaSeleccionada.anulador.name} (${ventaSeleccionada.anulador.rol})` : ventaSeleccionada.anulado_por ? `Usuario ID: ${ventaSeleccionada.anulado_por}` : 'Usuario no encontrado'}
                </p>
              </div>
            )}

            <div className="flex justify-end mt-8">
              <button
                className={`inline-flex items-center px-5 py-2.5 rounded-full font-semibold shadow-lg transition-all duration-200 ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 text-white hover:from-indigo-600 hover:via-slate-800 hover:to-slate-900'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
                onClick={() => setShowDetail(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Vista imprimible del ticket */}
      {showPrint && ventaSeleccionada && (
        <>
          {console.log('Datos de ventaSeleccionada:', ventaSeleccionada)}
          <TicketImprimible 
            venta={ventaSeleccionada} 
            onClose={() => setShowPrint(false)} 
          />
        </>
      )}
      
      {/* Modal de Productos Top */}
      {showProductosTop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
          <div
            className={`relative w-full max-w-4xl max-h-[90vh] sm:max-h-[80vh] overflow-hidden rounded-3xl border p-5 sm:p-7 lg:p-9 ${
              isDarkMode
                ? 'border-slate-700/60 bg-gradient-to-br from-slate-950/95 via-slate-900/85 to-slate-800/90 shadow-[0_25px_80px_rgba(2,6,23,0.6)]'
                : 'border-white/70 bg-gradient-to-br from-white/95 via-blue-50/85 to-emerald-50/90 shadow-[0_25px_80px_rgba(15,23,42,0.28)]'
            }`}
          >
            <div
              className={`pointer-events-none absolute -top-28 -right-28 h-64 w-64 rounded-full blur-3xl ${
                isDarkMode ? 'bg-blue-500/20' : 'bg-blue-300/30'
              }`}
            />
            <div
              className={`pointer-events-none absolute -bottom-32 -left-32 h-64 w-64 rounded-full blur-3xl ${
                isDarkMode ? 'bg-emerald-500/15' : 'bg-emerald-300/25'
              }`}
            />
            <div
              className={`pointer-events-none absolute top-1/3 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full blur-3xl ${
                isDarkMode ? 'bg-indigo-500/15' : 'bg-indigo-200/25'
              }`}
            />
            <div className="relative z-10 flex h-full flex-col">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 mb-6">
                <div className="flex items-center">
                  <div
                    className={`mr-3 sm:mr-4 inline-flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl border text-white shadow-lg ${
                      isDarkMode
                        ? 'border-slate-700/60 bg-gradient-to-br from-blue-500/80 via-indigo-500/80 to-purple-500/80 shadow-blue-900/40'
                        : 'border-white/60 bg-gradient-to-br from-blue-500/90 via-indigo-500/90 to-purple-500/90 shadow-blue-500/40'
                    }`}
                  >
                    <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <h2
                      className={`text-2xl sm:text-3xl font-bold tracking-tight ${
                        isDarkMode ? 'text-slate-100' : 'text-slate-900'
                      }`}
                    >
                      Productos Más Vendidos
                    </h2>
                    <p className={`text-sm sm:text-base ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Ranking dinámico con los productos estrella de tu ferretería
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowProductosTop(false)}
                  className={`transition-colors text-3xl font-bold leading-none ${
                    isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
                  }`}
                  aria-label="Cerrar"
                >
                  ×
                </button>
              </div>

              {!loadingProductosTop && !errorProductosTop && productosMasVendidos.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-5">
                  <div className={productosTopCardClass}>
                    <p className={productosTopCardLabelClass}>Producto estrella</p>
                    <p className={`mt-2 ${productosTopCardValueClass}`}>{topProductoDestacado?.nombre}</p>
                    <p className={`mt-3 text-sm font-medium ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      S/ {Number(topProductoDestacado?.total_generado || 0).toFixed(2)}
                    </p>
                  </div>
                  <div className={productosTopCardClass}>
                    <p className={productosTopCardLabelClass}>Unidades totales</p>
                    <p className={`mt-2 ${productosTopCardNumberClass}`}>
                      {totalUnidadesProductosTop}
                    </p>
                    <p className={`mt-1 ${productosTopCardHintClass}`}>Sumatoria de unidades vendidas</p>
                  </div>
                  <div className={productosTopCardClass}>
                    <p className={productosTopCardLabelClass}>Ticket promedio</p>
                    <p className={`mt-2 ${productosTopCardNumberClass}`}>
                      S/ {Number(promedioPrecioProductosTop).toFixed(2)}
                    </p>
                    <p className={`mt-1 ${productosTopCardHintClass}`}>Promedio por unidad vendida</p>
                  </div>
                </div>
              )}

              <div
                className={`flex-1 rounded-2xl border overflow-hidden ${
                  isDarkMode
                    ? 'border-slate-700/60 bg-slate-900/60 shadow-inner shadow-black/40 backdrop-blur'
                    : 'border-white/60 bg-white/55 shadow-inner backdrop-blur-sm'
                }`}
              >
                <div className="max-h-[60vh] sm:max-h-[60vh] overflow-y-auto">
                  <table className="w-full">
                    <thead
                      className={`sticky top-0 bg-gradient-to-r backdrop-blur-md ${
                        isDarkMode
                          ? 'from-slate-800/80 via-slate-900/80 to-slate-800/70'
                          : 'from-indigo-100/70 via-white to-emerald-100/70'
                      }`}
                    >
                      <tr>
                        <th
                          className={`px-3 sm:px-6 py-3 text-left text-[11px] sm:text-xs font-semibold tracking-[0.2em] uppercase ${
                            isDarkMode ? 'text-slate-300' : 'text-slate-600'
                          }`}
                        >
                          Ranking
                        </th>
                        <th
                          className={`px-3 sm:px-6 py-3 text-left text-[11px] sm:text-xs font-semibold tracking-[0.2em] uppercase ${
                            isDarkMode ? 'text-slate-300' : 'text-slate-600'
                          }`}
                        >
                          Producto
                        </th>
                        <th
                          className={`px-3 sm:px-6 py-3 text-left text-[11px] sm:text-xs font-semibold tracking-[0.2em] uppercase ${
                            isDarkMode ? 'text-slate-300' : 'text-slate-600'
                          }`}
                        >
                          Categoría
                        </th>
                        <th
                          className={`px-3 sm:px-6 py-3 text-center text-[11px] sm:text-xs font-semibold tracking-[0.2em] uppercase ${
                            isDarkMode ? 'text-slate-300' : 'text-slate-600'
                          }`}
                        >
                          Unidades
                        </th>
                        <th
                          className={`px-3 sm:px-6 py-3 text-center text-[11px] sm:text-xs font-semibold tracking-[0.2em] uppercase ${
                            isDarkMode ? 'text-slate-300' : 'text-slate-600'
                          }`}
                        >
                          Precio
                        </th>
                        <th
                          className={`px-3 sm:px-6 py-3 text-center text-[11px] sm:text-xs font-semibold tracking-[0.2em] uppercase ${
                            isDarkMode ? 'text-slate-300' : 'text-slate-600'
                          }`}
                        >
                          Total generado
                        </th>
                      </tr>
                    </thead>
                    <tbody
                      className={`bg-transparent divide-y ${
                        isDarkMode ? 'divide-slate-700/40' : 'divide-white/40'
                      }`}
                    >
                      {loadingProductosTop ? (
                        <tr>
                          <td
                            colSpan={6}
                            className={`text-center py-8 text-sm ${
                              isDarkMode ? 'text-slate-400' : 'text-slate-500'
                            }`}
                          >
                            Cargando productos...
                          </td>
                        </tr>
                      ) : errorProductosTop ? (
                        <tr>
                          <td
                            colSpan={6}
                            className={`text-center py-8 text-sm ${
                              isDarkMode ? 'text-red-400' : 'text-red-500'
                            }`}
                          >
                            {errorProductosTop}
                          </td>
                        </tr>
                      ) : productosMasVendidos.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className={`text-center py-8 text-sm ${
                              isDarkMode ? 'text-slate-500' : 'text-slate-400'
                            }`}
                          >
                            No hay productos vendidos disponibles
                          </td>
                        </tr>
                      ) : (
                        productosMasVendidos.map((producto, index) => {
                          const rank = index + 1;
                          const badgeGradients = [
                            'from-amber-400 via-orange-500 to-rose-500',
                            'from-sky-400 via-blue-500 to-indigo-500',
                            'from-emerald-400 via-green-500 to-teal-500'
                          ];
                          const badgeGradient = badgeGradients[index] || 'from-slate-400 via-slate-500 to-slate-600';

                          return (
                            <tr
                              key={producto.id ?? `${producto.nombre}-${index}`}
                              className={productosTopRowBaseClass}
                            >
                              <td className="px-3 sm:px-6 py-4 align-middle">
                                <span
                                  className={`inline-flex h-10 w-10 items-center justify-center rounded-[22px] bg-gradient-to-br ${badgeGradient} text-sm font-bold text-white shadow-lg shadow-slate-900/15`}
                                >
                                  {rank}
                                </span>
                              </td>
                              <td className="px-3 sm:px-6 py-4 align-middle">
                                <div className="flex flex-col">
                                  <span className={productosTopProductNameClass}>{producto.nombre}</span>
                                  {producto.descripcion && (
                                    <span className={productosTopDescriptionClass}>{producto.descripcion}</span>
                                  )}
                                </div>
                              </td>
                              <td className={productosTopCategoryClass}>{producto.categoria}</td>
                              <td className="px-3 sm:px-6 py-4 text-center align-middle">
                                <span className={productosTopUnitsChipClass}>
                                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a5 5 0 00-10 0v2M5 9h14l1 12H4L5 9z" />
                                  </svg>
                                  {producto.unidades_vendidas}
                                </span>
                              </td>
                              <td className={`px-3 sm:px-6 py-4 text-center align-middle ${productosTopPriceTextClass}`}>
                                S/ {Number(producto.precio || 0).toFixed(2)}
                              </td>
                              <td className={`px-3 sm:px-6 py-4 text-center align-middle ${productosTopTotalTextClass}`}>
                                S/ {Number(producto.total_generado || 0).toFixed(2)}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button 
                  onClick={() => setShowProductosTop(false)}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 via-fuchsia-500 to-purple-500 px-5 sm:px-7 py-2.5 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/40 transition-all duration-200 hover:from-rose-600 hover:via-fuchsia-600 hover:to-purple-600 hover:shadow-fuchsia-500/60"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de Anulación de Venta */}
      {showAnularModal && anularVentaSeleccionada && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div
            className={`relative w-full max-w-2xl overflow-hidden rounded-3xl border p-6 sm:p-7 shadow-[0_35px_90px_rgba(15,23,42,0.55)] transition-all duration-300 ${
              isDarkMode
                ? 'border-rose-500/30 bg-gradient-to-br from-slate-950/95 via-slate-900/88 to-slate-850/85 text-slate-100'
                : 'border-slate-100 bg-white text-slate-900'
            }`}
          >
            <div className="pointer-events-none absolute -top-28 -left-24 h-60 w-60 rounded-full bg-rose-500/30 blur-[130px]" />
            <div className="pointer-events-none absolute bottom-[-6rem] right-[-4rem] h-64 w-64 rounded-full bg-orange-400/22 blur-[120px]" />
            <div className="pointer-events-none absolute top-1/2 left-[35%] h-40 w-40 rounded-full bg-rose-400/16 blur-[140px]" />

            <button
              onClick={() => setShowAnularModal(false)}
              className={`absolute top-4 right-4 text-2xl font-bold transition-colors ${
                isDarkMode ? 'text-slate-400 hover:text-rose-200' : 'text-slate-400 hover:text-slate-600'
              }`}
              aria-label="Cerrar"
            >
              ×
            </button>

            <h3
              className={`text-2xl sm:text-3xl font-bold mb-6 tracking-tight ${
                isDarkMode ? 'text-rose-200 drop-shadow-[0_16px_32px_rgba(244,63,94,0.45)]' : 'text-gray-900'
              }`}
            >
              Anular Venta
            </h3>

            <div className={`mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
              {[{
                label: 'Venta #',
                value: anularVentaSeleccionada.numero || anularVentaSeleccionada.id,
                accent: 'secondary'
              }, {
                label: 'Cliente',
                value: anularVentaSeleccionada.cliente_nombre || '-',
                accent: 'secondary'
              }, {
                label: 'Total',
                value: formatCurrency(anularVentaSeleccionada.total),
                accent: 'primary'
              }].map((item, idx) => (
                <div
                  key={idx}
                  className={`rounded-2xl border p-4 shadow-inner transition-colors ${
                    item.accent === 'primary'
                      ? isDarkMode
                        ? 'border-rose-500/40 bg-gradient-to-br from-rose-500/25 via-rose-500/15 to-transparent'
                        : 'border-rose-200 bg-gradient-to-br from-rose-100 via-rose-50 to-white'
                      : isDarkMode
                      ? 'border-slate-700/60 bg-gradient-to-br from-slate-900/70 via-slate-900/50 to-transparent'
                      : 'border-slate-200 bg-gradient-to-br from-slate-100 via-white to-white'
                  }`}
                >
                  <p className={`text-[0.68rem] uppercase tracking-[0.28em] font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {item.label}
                  </p>
                  <p className={`mt-2 text-lg font-extrabold ${item.accent === 'primary' && isDarkMode ? 'text-rose-200' : ''}`}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            {anularError && (
              <div
                className={`mb-4 p-3 rounded-2xl border text-sm ${
                  isDarkMode ? 'border-rose-500/45 bg-rose-500/12 text-rose-200' : 'bg-red-50 border-red-200 text-red-700'
                }`}
              >
                {anularError}
              </div>
            )}

            {anularSuccess && (
              <div
                className={`mb-4 p-3 rounded-2xl border text-sm ${
                  isDarkMode ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200' : 'bg-green-50 border-green-200 text-green-700'
                }`}
              >
                {anularSuccess}
              </div>
            )}

            <div className="mb-5">
              <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-gray-700'}`}>
                Motivo de anulación <span className="text-red-500">*</span>
              </label>
              <div
                className={`rounded-2xl border overflow-hidden shadow-inner transition-colors ${
                  isDarkMode
                    ? 'border-rose-500/45 bg-rose-500/12 focus-within:border-rose-400/80'
                    : 'border-red-200 bg-red-50 focus-within:border-red-400'
                }`}
              >
                <textarea
                  value={anularMotivo}
                  onChange={(e) => setAnularMotivo(e.target.value)}
                  placeholder="Describe el motivo de la anulación..."
                  className={`w-full px-4 py-3 text-sm outline-none resize-none ${
                    isDarkMode ? 'bg-transparent text-slate-100 placeholder-rose-200' : 'bg-transparent text-gray-800 placeholder-red-400'
                  }`}
                  rows={3}
                />
              </div>
              <p className={`text-xs mt-2 ${isDarkMode ? 'text-rose-200' : 'text-red-500'}`}>
                Mínimo 5 caracteres. Este motivo quedará registrado en el sistema.
              </p>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAnularModal(false)}
                className={`inline-flex items-center px-4 py-2.5 rounded-full font-semibold shadow transition-all duration-200 ${
                  isDarkMode ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Cancelar
              </button>
              <button
                onClick={handleAnularVenta}
                disabled={!anularMotivo || anularMotivo.trim().length < 5}
                className={`inline-flex items-center px-4 py-2.5 rounded-full font-semibold transition-all duration-200 shadow-[0_12px_32px_rgba(244,63,94,0.45)] ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-rose-500 via-rose-600 to-rose-700 text-white hover:from-rose-400 hover:via-rose-500 hover:to-rose-600 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-300'
                    : 'bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white hover:from-red-400 hover:via-red-500 hover:to-red-600 disabled:bg-gray-400 disabled:text-gray-200'
                }`}
              >
                Anular Venta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ventas; 