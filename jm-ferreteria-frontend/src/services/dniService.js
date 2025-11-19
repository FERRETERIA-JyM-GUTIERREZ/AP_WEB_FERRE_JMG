// Servicio para búsqueda de DNI usando el backend (que consulta DECOLECTA API)
import api from './api';
import axios from 'axios';

class DniService {
    constructor() {
        this.baseUrl = 'https://dniperu.com/buscar-dni-nombres-apellidos/';
    }

    // Método principal que usa el backend para evitar problemas de CORS
    async buscarPorDni(dni) {
        try {
            // Validar formato del DNI
            if (!/^\d{8}$/.test(dni)) {
                throw new Error('DNI debe tener 8 dígitos numéricos');
            }

            console.log('🔍 Buscando datos a través del backend (DECOLECTA API)...');
            console.log('📡 URL de API base:', api.defaults.baseURL);
            console.log('📤 Enviando DNI:', dni);
            
            // Construir la URL completa manualmente para asegurar que sea correcta
            const baseURL = api.defaults.baseURL || 'http://localhost:8000/api';
            const urlCompleta = baseURL.endsWith('/') 
                ? `${baseURL}buscar-dni` 
                : `${baseURL}/buscar-dni`;
            
            console.log('🌐 URL completa construida:', urlCompleta);
            console.log('🔧 Configuración de axios:', {
                baseURL: api.defaults.baseURL,
                url: 'buscar-dni',
                urlCompleta: urlCompleta
            });
            
            // Usar axios directamente con la URL completa para evitar problemas de concatenación
            const response = await axios.post(urlCompleta, { dni }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            if (response.data.success) {
                console.log('✅ Datos obtenidos de DECOLECTA API a través del backend');
                return response.data;
            }

            // Si no encuentra datos, retornar error
            console.log('❌ No se encontraron datos para este DNI');
            return {
                success: false,
                error: response.data.error || 'No se encontraron datos para este DNI en la base de datos oficial'
            };

        } catch (error) {
            console.error('Error en búsqueda de DNI:', error);
            
            // Manejar errores de respuesta
            if (error.response) {
                return {
                    success: false,
                    error: error.response.data?.error || `Error: ${error.response.status}`
                };
            }
            
            return {
                success: false,
                error: error.message || 'Error al conectar con el servidor'
            };
        }
    }

    // Método para hacer scraping de la página real
    async scrapearDniPeru(dni) {
        try {
            // Crear un iframe oculto para hacer la petición
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = this.baseUrl;
            
            return new Promise((resolve, reject) => {
                iframe.onload = async () => {
                    try {
                        // Esperar a que la página cargue completamente
                        await this.delay(2000);
                        
                        // Intentar acceder al contenido del iframe
                        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                        
                        // Buscar el formulario y enviar el DNI
                        const form = iframeDoc.querySelector('form');
                        if (form) {
                            // Encontrar el campo de DNI
                            const dniInput = iframeDoc.querySelector('input[name="dni"]') || 
                                           iframeDoc.querySelector('input[type="text"]');
                            
                            if (dniInput) {
                                dniInput.value = dni;
                                
                                // Encontrar el botón de búsqueda
                                const submitButton = iframeDoc.querySelector('input[type="submit"]') ||
                                                   iframeDoc.querySelector('button[type="submit"]') ||
                                                   iframeDoc.querySelector('button');
                                
                                if (submitButton) {
                                    submitButton.click();
                                    
                                    // Esperar a que se procese la búsqueda
                                    await this.delay(3000);
                                    
                                    // Buscar el resultado
                                    const resultado = this.extraerDatosDelResultado(iframeDoc, dni);
                                    
                                    if (resultado) {
                                        resolve({
                                            success: true,
                                            datos: resultado
                                        });
                                    } else {
                                        resolve({ success: false });
                                    }
                                } else {
                                    resolve({ success: false });
                                }
                            } else {
                                resolve({ success: false });
                            }
                        } else {
                            resolve({ success: false });
                        }
                    } catch (error) {
                        console.error('Error en scraping:', error);
                        resolve({ success: false });
                    } finally {
                        // Limpiar el iframe
                        document.body.removeChild(iframe);
                    }
                };
                
                iframe.onerror = () => {
                    document.body.removeChild(iframe);
                    resolve({ success: false });
                };
                
                document.body.appendChild(iframe);
            });
            
        } catch (error) {
            console.error('Error en scrapearDniPeru:', error);
            return { success: false };
        }
    }

    // Método para extraer datos del resultado
    extraerDatosDelResultado(doc, dni) {
        try {
            // Buscar el textarea con los datos
            const textarea = doc.querySelector('#resultado_dni');
            if (textarea) {
                const contenido = textarea.value || textarea.textContent;
                return this.parsearDatosPersona(contenido);
            }
            
            // Buscar en todo el documento
            const todoElTexto = doc.body.textContent;
            if (todoElTexto.includes(dni)) {
                // Buscar patrones de nombres
                const patrones = {
                    nombres: /Nombres:\s*([A-ZÁÉÍÓÚÑ\s]+)/,
                    apellido_paterno: /Apellido Paterno:\s*([A-ZÁÉÍÓÚÑ\s]+)/,
                    apellido_materno: /Apellido Materno:\s*([A-ZÁÉÍÓÚÑ\s]+)/,
                    codigo_verificacion: /Código de Verificación:\s*(\d+)/
                };
                
                const datos = { dni };
                
                for (const [campo, patron] of Object.entries(patrones)) {
                    const match = todoElTexto.match(patron);
                    if (match) {
                        datos[campo] = match[1].trim();
                    }
                }
                
                if (datos.nombres) {
                    // Construir nombre completo
                    let nombreCompleto = datos.nombres;
                    if (datos.apellido_paterno) {
                        nombreCompleto += ' ' + datos.apellido_paterno;
                    }
                    if (datos.apellido_materno) {
                        nombreCompleto += ' ' + datos.apellido_materno;
                    }
                    
                    datos.nombre_completo = nombreCompleto.trim();
                    
                    return datos;
                }
            }
            
            return null;
        } catch (error) {
            console.error('Error extrayendo datos:', error);
            return null;
        }
    }

    // Método para parsear datos de persona
    parsearDatosPersona(contenido) {
        if (!contenido) return null;
        
        const patrones = {
            dni: /Número de DNI:\s*(\d+)/,
            nombres: /Nombres:\s*([A-ZÁÉÍÓÚÑ\s]+)/,
            apellido_paterno: /Apellido Paterno:\s*([A-ZÁÉÍÓÚÑ\s]+)/,
            apellido_materno: /Apellido Materno:\s*([A-ZÁÉÍÓÚÑ\s]+)/,
            codigo_verificacion: /Código de Verificación:\s*(\d+)/
        };
        
        const datos = {};
        
        for (const [campo, patron] of Object.entries(patrones)) {
            const match = contenido.match(patron);
            if (match) {
                datos[campo] = match[1].trim();
            }
        }
        
        if (datos.dni && datos.nombres) {
            // Construir nombre completo
            let nombreCompleto = datos.nombres;
            if (datos.apellido_paterno) {
                nombreCompleto += ' ' + datos.apellido_paterno;
            }
            if (datos.apellido_materno) {
                nombreCompleto += ' ' + datos.apellido_materno;
            }
            
            return {
                dni: datos.dni,
                nombres: datos.nombres,
                apellido_paterno: datos.apellido_paterno || '',
                apellido_materno: datos.apellido_materno || '',
                nombre_completo: nombreCompleto.trim(),
                codigo_verificacion: datos.codigo_verificacion || ''
            };
        }
        
        return null;
    }

    // Método para usar la API real encontrada (DECOLECTA API)
    async buscarConAPIReal(dni) {
        try {
            // Token actualizado de DECOLECTA para búsqueda por DNI en ventas
            const apiToken = 'sk_11599.3v55Sst9X1BbNLvXVbeYUw6q8Rvys81x';
            
            // URL base de DECOLECTA API según documentación
            const apiBaseUrl = 'https://api.decolecta.com';
            
            console.log('🔑 Usando token de DECOLECTA API...');
            
            // Formato correcto según documentación: Authorization: Bearer <API_KEY>
            // Lista de endpoints posibles a probar
            const endpoints = [
                `/dni/${dni}`,
                `/api/dni/${dni}`,
                `/v1/dni/${dni}`,
                `/personas/${dni}`,
                `/api/personas/${dni}`,
                `/v1/personas/${dni}`,
                `/reniec/dni/${dni}`,
                `/api/reniec/dni/${dni}`
            ];
            
            let response = null;
            let endpointUsado = '';
            
            // Probar cada endpoint hasta encontrar uno que funcione
            for (const endpoint of endpoints) {
                endpointUsado = endpoint;
                console.log(`🔍 Intentando endpoint: ${apiBaseUrl}${endpoint}`);
                
                response = await fetch(`${apiBaseUrl}${endpoint}`, {
                method: 'GET',
                headers: {
                        'Authorization': `Bearer ${apiToken}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
                
                // Si la respuesta es exitosa o es un error diferente a 404/403, salir del loop
                if (response.ok || (response.status !== 404 && response.status !== 403)) {
                    console.log(`✅ Endpoint encontrado: ${endpoint} (Status: ${response.status})`);
                    break;
                }
                
                // Si es 404, continuar con el siguiente endpoint
                if (response.status === 404) {
                    console.log(`⚠️ Endpoint ${endpoint} no encontrado (404), probando siguiente...`);
                    continue;
                }
                
                // Si es 403, puede ser que el endpoint exista pero falten permisos
                if (response.status === 403) {
                    console.log(`⚠️ Endpoint ${endpoint} requiere permisos (403), probando siguiente...`);
                    continue;
                }
            }

            // Si response es null, significa que todos los endpoints fallaron
            if (!response) {
                console.log('❌ Todos los endpoints probados fallaron');
                return { 
                    success: false, 
                    error: 'No se pudo conectar con la API. Verifique el token y los permisos en decolecta.com' 
                };
            }

            if (response.ok) {
                const data = await response.json();
                console.log('📦 Respuesta de DECOLECTA API:', data);
                
                // Manejar diferentes formatos de respuesta de DECOLECTA
                let datosPersona = null;
                
                // Formato 1: data.datos (formato miapi.cloud)
                if (data.success && data.datos) {
                    datosPersona = data.datos;
                }
                // Formato 2: data directamente (formato DECOLECTA estándar)
                else if (data.dni || data.nombres) {
                    datosPersona = data;
                }
                // Formato 3: data.data
                else if (data.data) {
                    datosPersona = data.data;
                }
                // Formato 4: data.persona
                else if (data.persona) {
                    datosPersona = data.persona;
                }
                
                if (datosPersona && (datosPersona.dni || datosPersona.nombres)) {
                    console.log('✅ API DECOLECTA funcionó correctamente');
                    
                    // Normalizar los datos al formato esperado por la aplicación
                    const nombres = datosPersona.nombres || datosPersona.nombre || '';
                    const apePaterno = datosPersona.ape_paterno || datosPersona.apellido_paterno || datosPersona.apellidoPaterno || '';
                    const apeMaterno = datosPersona.ape_materno || datosPersona.apellido_materno || datosPersona.apellidoMaterno || '';
                    const nombreCompleto = datosPersona.nombre_completo || 
                                         datosPersona.nombreCompleto || 
                                         `${nombres} ${apePaterno} ${apeMaterno}`.trim();
                    
                    return {
                        success: true,
                        datos: {
                            dni: datosPersona.dni || dni,
                            nombres: nombres,
                            apellido_paterno: apePaterno,
                            apellido_materno: apeMaterno,
                            nombre_completo: nombreCompleto,
                            codigo_verificacion: datosPersona.codigo_verificacion || datosPersona.codigoVerificacion || '',
                            domicilio: datosPersona.domicilio || datosPersona.domiciliado || null
                        },
                        api_source: 'DECOLECTA API (datos oficiales RENIEC)',
                        response_time: data.response_time || data.responseTime || null
                    };
                } else {
                    console.log('⚠️ Respuesta sin datos válidos:', data);
                    return { success: false, error: 'No se encontraron datos en la API' };
                }
            } else if (response.status === 401) {
                console.log('❌ Token inválido o expirado');
                const errorData = await response.json().catch(() => ({}));
                return { 
                    success: false, 
                    error: errorData.message || 'Token inválido o expirado. Verifique el token proporcionado.' 
                };
            } else if (response.status === 403) {
                console.log('❌ Acceso prohibido (403) - Verifique el formato del token');
                const errorData = await response.json().catch(() => ({}));
                return { 
                    success: false, 
                    error: errorData.message || 'Acceso prohibido. El token puede estar en formato incorrecto o no tener permisos suficientes.' 
                };
            } else {
                console.log(`❌ Error HTTP: ${response.status}`);
                const errorData = await response.json().catch(() => ({}));
                return { 
                    success: false, 
                    error: errorData.message || `Error HTTP: ${response.status}` 
                };
            }
        } catch (error) {
            console.error('Error con API real:', error);
            return { success: false, error: error.message };
        }
    }
}

export default new DniService(); 