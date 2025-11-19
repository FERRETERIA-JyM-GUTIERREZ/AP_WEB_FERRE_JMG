import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const ReportChart = ({ tipo, data, loading }) => {
  if (loading) {
    return (
      <div className="h-48 sm:h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Cargando gráfico...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-48 sm:h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl sm:text-4xl mb-2">📈</div>
          <p className="text-xs sm:text-sm text-gray-600">No hay datos para mostrar</p>
        </div>
      </div>
    );
  }

  // Función para crear gradientes 3D
  const createGradient = (ctx, colorStart, colorEnd) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, colorStart);
    gradient.addColorStop(1, colorEnd);
    return gradient;
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 13,
            weight: 'bold'
          },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle',
          color: '#ffffff' // Color blanco para las etiquetas
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        boxPadding: 6,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            // Obtener el valor según el tipo de gráfico
            let value = null;
            if (context.parsed !== null && context.parsed !== undefined) {
              // Para gráficos de línea y barras
              if (context.parsed.y !== null && context.parsed.y !== undefined) {
                value = context.parsed.y;
              }
              // Para gráficos de tipo Doughnut/Pie
              else if (typeof context.parsed === 'number') {
                value = context.parsed;
              }
              // Intentar obtener el valor del dataset
              else if (context.dataset.data && context.dataIndex !== undefined) {
                value = context.dataset.data[context.dataIndex];
              }
            }
            
            if (value !== null && value !== undefined && !isNaN(value)) {
              if (label.includes('Ingresos') || label.includes('S/') || label.includes('Gastado') || label.includes('total_ingresos')) {
                label += 'S/ ' + Number(value).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
              } else {
                label += Number(value).toLocaleString('es-PE');
              }
            } else {
              label += '0';
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            size: 11,
            weight: '500'
          },
          color: 'rgba(255, 255, 255, 0.7)'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          lineWidth: 1
        },
        border: {
          color: 'rgba(255, 255, 255, 0.2)'
        }
      },
      x: {
        ticks: {
          font: {
            size: 11,
            weight: '500'
          },
          color: 'rgba(255, 255, 255, 0.7)'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          lineWidth: 1
        },
        border: {
          color: 'rgba(255, 255, 255, 0.2)'
        }
      }
    }
  };

  const renderChart = () => {
    switch (tipo) {
      case 'ventas':
        if (data.ventas_por_dia && data.ventas_por_dia.length > 0) {
          const chartData = {
            labels: data.ventas_por_dia.map(item => new Date(item.fecha).toLocaleDateString('es-ES', { 
              day: '2-digit', 
              month: '2-digit' 
            })),
            datasets: [
              {
                label: 'Ventas',
                data: data.ventas_por_dia.map(item => item.total_ventas),
                borderColor: 'rgb(96, 165, 250)',
                backgroundColor: (context) => {
                  const ctx = context.chart.ctx;
                  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                  gradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
                  gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.2)');
                  gradient.addColorStop(1, 'rgba(59, 130, 246, 0.05)');
                  return gradient;
                },
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 5,
                pointHoverRadius: 8,
                pointBackgroundColor: 'rgb(96, 165, 250)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverBackgroundColor: 'rgb(59, 130, 246)',
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 3
              },
              {
                label: 'Ingresos (S/)',
                data: data.ventas_por_dia.map(item => item.ingresos),
                borderColor: 'rgb(74, 222, 128)',
                backgroundColor: (context) => {
                  const ctx = context.chart.ctx;
                  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                  gradient.addColorStop(0, 'rgba(34, 197, 94, 0.4)');
                  gradient.addColorStop(0.5, 'rgba(34, 197, 94, 0.2)');
                  gradient.addColorStop(1, 'rgba(34, 197, 94, 0.05)');
                  return gradient;
                },
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 5,
                pointHoverRadius: 8,
                pointBackgroundColor: 'rgb(74, 222, 128)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverBackgroundColor: 'rgb(34, 197, 94)',
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 3,
                yAxisID: 'y1'
              }
            ]
          };

          const options = {
            ...chartOptions,
            elements: {
              point: {
                hoverRadius: 8,
                hoverBorderWidth: 3
              },
              line: {
                borderJoinStyle: 'round',
                borderCapStyle: 'round'
              }
            },
            scales: {
              y: {
                type: 'linear',
                display: true,
                position: 'left',
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Cantidad de Ventas',
                  font: {
                    size: 13,
                    weight: 'bold'
                  },
                  color: 'rgba(255, 255, 255, 0.9)'
                },
                ticks: {
                  ...chartOptions.scales.y.ticks
                },
                grid: {
                  ...chartOptions.scales.y.grid
                },
                border: {
                  ...chartOptions.scales.y.border
                }
              },
              y1: {
                type: 'linear',
                display: true,
                position: 'right',
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Ingresos (S/)',
                  font: {
                    size: 13,
                    weight: 'bold'
                  },
                  color: 'rgba(255, 255, 255, 0.9)'
                },
                grid: {
                  drawOnChartArea: false,
                  color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                  ...chartOptions.scales.y.ticks,
                  callback: function(value) {
                    return 'S/ ' + value.toLocaleString('es-PE');
                  }
                },
                border: {
                  color: 'rgba(255, 255, 255, 0.2)'
                }
              },
              x: {
                ...chartOptions.scales.x
              }
            }
          };

          return (
            <div className="relative" style={{
              perspective: '1200px',
              transformStyle: 'preserve-3d',
              width: '100%',
              height: '100%'
            }}>
              <div 
                className="chart-3d-container-line"
                style={{
                  transform: 'rotateY(-10deg) rotateX(3deg)',
                  transformStyle: 'preserve-3d',
                  animation: 'float3DLine 7s ease-in-out infinite',
                  width: '100%',
                  height: '100%'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.animation = 'rotate3DLine 5s ease-in-out infinite, pulse3DLine 2.5s ease-in-out infinite';
                  e.currentTarget.style.transform = 'rotateY(-5deg) rotateX(5deg) scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.animation = 'float3DLine 7s ease-in-out infinite';
                  e.currentTarget.style.transform = 'rotateY(-10deg) rotateX(3deg) scale(1)';
                }}
              >
                <Line data={chartData} options={options} />
              </div>
              <style>{`
                .chart-3d-container-line {
                  filter: drop-shadow(0 25px 50px rgba(0, 0, 0, 0.5)) 
                          drop-shadow(0 15px 30px rgba(59, 130, 246, 0.4))
                          drop-shadow(0 5px 15px rgba(34, 197, 94, 0.3));
                  will-change: transform;
                }
                .chart-3d-container-line canvas {
                  filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.4))
                          drop-shadow(0 10px 20px rgba(59, 130, 246, 0.3));
                  transition: filter 0.3s ease;
                }
                .chart-3d-container-line:hover canvas {
                  filter: drop-shadow(0 30px 60px rgba(0, 0, 0, 0.5))
                          drop-shadow(0 15px 30px rgba(59, 130, 246, 0.5))
                          drop-shadow(0 5px 15px rgba(34, 197, 94, 0.4));
                }
                @keyframes float3DLine {
                  0%, 100% {
                    transform: rotateY(-10deg) rotateX(3deg) translateY(0px);
                  }
                  25% {
                    transform: rotateY(-8deg) rotateX(5deg) translateY(-3px);
                  }
                  50% {
                    transform: rotateY(-12deg) rotateX(2deg) translateY(0px);
                  }
                  75% {
                    transform: rotateY(-8deg) rotateX(5deg) translateY(-3px);
                  }
                }
                @keyframes rotate3DLine {
                  0% {
                    transform: rotateY(-5deg) rotateX(5deg) rotateZ(0deg) scale(1.05);
                  }
                  25% {
                    transform: rotateY(-2deg) rotateX(7deg) rotateZ(0.5deg) scale(1.05);
                  }
                  50% {
                    transform: rotateY(-8deg) rotateX(3deg) rotateZ(-0.5deg) scale(1.05);
                  }
                  75% {
                    transform: rotateY(-2deg) rotateX(7deg) rotateZ(0.5deg) scale(1.05);
                  }
                  100% {
                    transform: rotateY(-5deg) rotateX(5deg) rotateZ(0deg) scale(1.05);
                  }
                }
                @keyframes pulse3DLine {
                  0%, 100% {
                    filter: drop-shadow(0 25px 50px rgba(0, 0, 0, 0.5)) 
                            drop-shadow(0 15px 30px rgba(59, 130, 246, 0.4));
                  }
                  50% {
                    filter: drop-shadow(0 30px 60px rgba(0, 0, 0, 0.6)) 
                            drop-shadow(0 20px 40px rgba(59, 130, 246, 0.6));
                  }
                }
              `}</style>
            </div>
          );
        }
        break;

      case 'productos':
        // Primero intentar con productos más vendidos
        if (data.productos_mas_vendidos && data.productos_mas_vendidos.length > 0) {
          const top10 = data.productos_mas_vendidos.slice(0, 10);
          const chartData = {
            labels: top10.map(item => item.nombre.length > 20 ? item.nombre.substring(0, 20) + '...' : item.nombre),
            datasets: [
              {
                label: 'Unidades Vendidas',
                data: top10.map(item => item.unidades_vendidas),
                backgroundColor: (context) => {
                  const ctx = context.chart.ctx;
                  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                  const colors = [
                    'rgba(59, 130, 246, 0.9)',
                    'rgba(16, 185, 129, 0.9)',
                    'rgba(245, 158, 11, 0.9)',
                    'rgba(239, 68, 68, 0.9)',
                    'rgba(139, 92, 246, 0.9)',
                    'rgba(236, 72, 153, 0.9)',
                    'rgba(34, 197, 94, 0.9)',
                    'rgba(251, 146, 60, 0.9)',
                    'rgba(99, 102, 241, 0.9)',
                    'rgba(168, 85, 247, 0.9)'
                  ];
                  return colors[context.dataIndex % colors.length];
                },
                borderColor: (context) => {
                  const colors = [
                    'rgb(59, 130, 246)',
                    'rgb(16, 185, 129)',
                    'rgb(245, 158, 11)',
                    'rgb(239, 68, 68)',
                    'rgb(139, 92, 246)',
                    'rgb(236, 72, 153)',
                    'rgb(34, 197, 94)',
                    'rgb(251, 146, 60)',
                    'rgb(99, 102, 241)',
                    'rgb(168, 85, 247)'
                  ];
                  return colors[context.dataIndex % colors.length];
                },
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
                maxBarThickness: 60
              }
            ]
          };

          const barOptions = {
            ...chartOptions,
            plugins: {
              ...chartOptions.plugins,
              legend: {
                display: false
              }
            },
            scales: {
              ...chartOptions.scales,
              x: {
                ...chartOptions.scales.x,
                grid: {
                  display: false
                }
              },
              y: {
                ...chartOptions.scales.y,
                grid: {
                  ...chartOptions.scales.y.grid
                }
              }
            }
          };

          return (
            <div className="relative" style={{
              perspective: '1200px',
              transformStyle: 'preserve-3d',
              width: '100%',
              height: '100%'
            }}>
              <div 
                className="chart-3d-container-bar"
                style={{
                  transform: 'rotateY(-12deg) rotateX(4deg)',
                  transformStyle: 'preserve-3d',
                  animation: 'float3DBar 6.5s ease-in-out infinite',
                  width: '100%',
                  height: '100%'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.animation = 'rotate3DBar 4.5s ease-in-out infinite, pulse3DBar 2s ease-in-out infinite';
                  e.currentTarget.style.transform = 'rotateY(-7deg) rotateX(6deg) scale(1.06)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.animation = 'float3DBar 6.5s ease-in-out infinite';
                  e.currentTarget.style.transform = 'rotateY(-12deg) rotateX(4deg) scale(1)';
                }}
              >
                <Bar data={chartData} options={barOptions} />
              </div>
              <style>{`
                .chart-3d-container-bar {
                  filter: drop-shadow(0 25px 50px rgba(0, 0, 0, 0.5)) 
                          drop-shadow(0 15px 30px rgba(59, 130, 246, 0.4))
                          drop-shadow(0 5px 15px rgba(16, 185, 129, 0.3));
                  will-change: transform;
                }
                .chart-3d-container-bar canvas {
                  filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.4))
                          drop-shadow(0 10px 20px rgba(59, 130, 246, 0.3));
                  transition: filter 0.3s ease;
                }
                .chart-3d-container-bar:hover canvas {
                  filter: drop-shadow(0 30px 60px rgba(0, 0, 0, 0.5))
                          drop-shadow(0 15px 30px rgba(59, 130, 246, 0.5))
                          drop-shadow(0 5px 15px rgba(16, 185, 129, 0.4));
                }
                @keyframes float3DBar {
                  0%, 100% {
                    transform: rotateY(-12deg) rotateX(4deg) translateY(0px);
                  }
                  25% {
                    transform: rotateY(-9deg) rotateX(6deg) translateY(-4px);
                  }
                  50% {
                    transform: rotateY(-15deg) rotateX(3deg) translateY(0px);
                  }
                  75% {
                    transform: rotateY(-9deg) rotateX(6deg) translateY(-4px);
                  }
                }
                @keyframes rotate3DBar {
                  0% {
                    transform: rotateY(-7deg) rotateX(6deg) rotateZ(0deg) scale(1.06);
                  }
                  25% {
                    transform: rotateY(-4deg) rotateX(8deg) rotateZ(0.5deg) scale(1.06);
                  }
                  50% {
                    transform: rotateY(-10deg) rotateX(4deg) rotateZ(-0.5deg) scale(1.06);
                  }
                  75% {
                    transform: rotateY(-4deg) rotateX(8deg) rotateZ(0.5deg) scale(1.06);
                  }
                  100% {
                    transform: rotateY(-7deg) rotateX(6deg) rotateZ(0deg) scale(1.06);
                  }
                }
                @keyframes pulse3DBar {
                  0%, 100% {
                    filter: drop-shadow(0 25px 50px rgba(0, 0, 0, 0.5)) 
                            drop-shadow(0 15px 30px rgba(59, 130, 246, 0.4));
                  }
                  50% {
                    filter: drop-shadow(0 30px 60px rgba(0, 0, 0, 0.6)) 
                            drop-shadow(0 20px 40px rgba(59, 130, 246, 0.6));
                  }
                }
              `}</style>
            </div>
          );
        }
        // Si no hay productos vendidos, mostrar productos por categoría
        else if (data.productos_por_categoria && data.productos_por_categoria.length > 0) {
          const chartData = {
            labels: data.productos_por_categoria.map(item => item.categoria.length > 15 ? item.categoria.substring(0, 15) + '...' : item.categoria),
            datasets: [
              {
                label: 'Total Productos',
                data: data.productos_por_categoria.map(item => item.total_productos),
                backgroundColor: [
                  'rgba(59, 130, 246, 0.8)',
                  'rgba(16, 185, 129, 0.8)',
                  'rgba(245, 158, 11, 0.8)',
                  'rgba(239, 68, 68, 0.8)',
                  'rgba(139, 92, 246, 0.8)',
                  'rgba(236, 72, 153, 0.8)',
                  'rgba(34, 197, 94, 0.8)',
                  'rgba(251, 146, 60, 0.8)',
                  'rgba(99, 102, 241, 0.8)',
                  'rgba(168, 85, 247, 0.8)'
                ],
                borderWidth: 1
              }
            ]
          };

          return (
            <div className="relative" style={{
              perspective: '1200px',
              transformStyle: 'preserve-3d',
              width: '100%',
              height: '100%'
            }}>
              <div 
                className="chart-3d-container-bar"
                style={{
                  transform: 'rotateY(-12deg) rotateX(4deg)',
                  transformStyle: 'preserve-3d',
                  animation: 'float3DBar 6.5s ease-in-out infinite',
                  width: '100%',
                  height: '100%'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.animation = 'rotate3DBar 4.5s ease-in-out infinite, pulse3DBar 2s ease-in-out infinite';
                  e.currentTarget.style.transform = 'rotateY(-7deg) rotateX(6deg) scale(1.06)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.animation = 'float3DBar 6.5s ease-in-out infinite';
                  e.currentTarget.style.transform = 'rotateY(-12deg) rotateX(4deg) scale(1)';
                }}
              >
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>
          );
        }
        break;

      case 'clientes':
        if (data.clientes_mas_frecuentes && data.clientes_mas_frecuentes.length > 0) {
          const top8 = data.clientes_mas_frecuentes.slice(0, 8);
          // Colores vibrantes y distintos para cada cliente
          const clientColors = [
            { bg: 'rgba(59, 130, 246, 0.9)', border: 'rgb(59, 130, 246)' },      // Azul
            { bg: 'rgba(16, 185, 129, 0.9)', border: 'rgb(16, 185, 129)' },    // Verde
            { bg: 'rgba(245, 158, 11, 0.9)', border: 'rgb(245, 158, 11)' },    // Amarillo
            { bg: 'rgba(239, 68, 68, 0.9)', border: 'rgb(239, 68, 68)' },     // Rojo
            { bg: 'rgba(139, 92, 246, 0.9)', border: 'rgb(139, 92, 246)' },    // Morado
            { bg: 'rgba(236, 72, 153, 0.9)', border: 'rgb(236, 72, 153)' },   // Rosa
            { bg: 'rgba(34, 197, 94, 0.9)', border: 'rgb(34, 197, 94)' },      // Verde esmeralda
            { bg: 'rgba(251, 146, 60, 0.9)', border: 'rgb(251, 146, 60)' }     // Naranja
          ];
          
          const chartData = {
            labels: top8.map(item => item.cliente_nombre.length > 15 ? item.cliente_nombre.substring(0, 15) + '...' : item.cliente_nombre),
            datasets: [
              {
                label: 'Total Gastado (S/)',
                data: top8.map(item => item.total_gastado),
                backgroundColor: (context) => {
                  const colorIndex = context.dataIndex % clientColors.length;
                  return clientColors[colorIndex].bg;
                },
                borderColor: (context) => {
                  const colorIndex = context.dataIndex % clientColors.length;
                  return clientColors[colorIndex].border;
                },
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
                maxBarThickness: 60
              }
            ]
          };

          const clientOptions = {
            ...chartOptions,
            plugins: {
              ...chartOptions.plugins,
              legend: {
                display: false
              }
            },
            scales: {
              ...chartOptions.scales,
              x: {
                ...chartOptions.scales.x,
                grid: {
                  display: false
                }
              },
              y: {
                ...chartOptions.scales.y,
                grid: {
                  ...chartOptions.scales.y.grid
                },
                ticks: {
                  ...chartOptions.scales.y.ticks,
                  callback: function(value) {
                    return 'S/ ' + value.toLocaleString('es-PE');
                  }
                }
              }
            }
          };

          return (
            <div className="relative" style={{
              perspective: '1200px',
              transformStyle: 'preserve-3d',
              width: '100%',
              height: '100%'
            }}>
              <div 
                className="chart-3d-container-bar-clientes"
                style={{
                  transform: 'rotateY(-12deg) rotateX(4deg)',
                  transformStyle: 'preserve-3d',
                  animation: 'float3DBarClientes 6.5s ease-in-out infinite',
                  width: '100%',
                  height: '100%'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.animation = 'rotate3DBarClientes 4.5s ease-in-out infinite, pulse3DBarClientes 2s ease-in-out infinite';
                  e.currentTarget.style.transform = 'rotateY(-7deg) rotateX(6deg) scale(1.06)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.animation = 'float3DBarClientes 6.5s ease-in-out infinite';
                  e.currentTarget.style.transform = 'rotateY(-12deg) rotateX(4deg) scale(1)';
                }}
              >
                <Bar data={chartData} options={clientOptions} />
              </div>
              <style>{`
                .chart-3d-container-bar-clientes {
                  filter: drop-shadow(0 25px 50px rgba(0, 0, 0, 0.5)) 
                          drop-shadow(0 15px 30px rgba(139, 92, 246, 0.4))
                          drop-shadow(0 5px 15px rgba(168, 85, 247, 0.3));
                  will-change: transform;
                }
                .chart-3d-container-bar-clientes canvas {
                  filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.4))
                          drop-shadow(0 10px 20px rgba(139, 92, 246, 0.3));
                  transition: filter 0.3s ease;
                }
                .chart-3d-container-bar-clientes:hover canvas {
                  filter: drop-shadow(0 30px 60px rgba(0, 0, 0, 0.5))
                          drop-shadow(0 15px 30px rgba(139, 92, 246, 0.5))
                          drop-shadow(0 5px 15px rgba(168, 85, 247, 0.4));
                }
                @keyframes float3DBarClientes {
                  0%, 100% {
                    transform: rotateY(-12deg) rotateX(4deg) translateY(0px);
                  }
                  25% {
                    transform: rotateY(-9deg) rotateX(6deg) translateY(-4px);
                  }
                  50% {
                    transform: rotateY(-15deg) rotateX(3deg) translateY(0px);
                  }
                  75% {
                    transform: rotateY(-9deg) rotateX(6deg) translateY(-4px);
                  }
                }
                @keyframes rotate3DBarClientes {
                  0% {
                    transform: rotateY(-7deg) rotateX(6deg) rotateZ(0deg) scale(1.06);
                  }
                  25% {
                    transform: rotateY(-4deg) rotateX(8deg) rotateZ(0.5deg) scale(1.06);
                  }
                  50% {
                    transform: rotateY(-10deg) rotateX(4deg) rotateZ(-0.5deg) scale(1.06);
                  }
                  75% {
                    transform: rotateY(-4deg) rotateX(8deg) rotateZ(0.5deg) scale(1.06);
                  }
                  100% {
                    transform: rotateY(-7deg) rotateX(6deg) rotateZ(0deg) scale(1.06);
                  }
                }
                @keyframes pulse3DBarClientes {
                  0%, 100% {
                    filter: drop-shadow(0 25px 50px rgba(0, 0, 0, 0.5)) 
                            drop-shadow(0 15px 30px rgba(139, 92, 246, 0.4));
                  }
                  50% {
                    filter: drop-shadow(0 30px 60px rgba(0, 0, 0, 0.6)) 
                            drop-shadow(0 20px 40px rgba(139, 92, 246, 0.6));
                  }
                }
              `}</style>
            </div>
          );
        }
        break;

      case 'financiero':
        if (data.ingresos_por_metodo && data.ingresos_por_metodo.length > 0) {
          // Mapeo de colores mejorados con gradientes 3D para cada método de pago
          const metodoPagoColors = {
            'efectivo': { 
              light: 'rgba(74, 222, 128, 1)',      // Verde claro brillante
              base: 'rgba(34, 197, 94, 1)',         // Verde esmeralda
              dark: 'rgba(22, 163, 74, 1)',         // Verde oscuro
              border: 'rgba(255, 255, 255, 0.8)'    // Borde blanco brillante
            },
            'tarjeta': { 
              light: 'rgba(129, 140, 248, 1)',      // Índigo claro brillante
              base: 'rgba(99, 102, 241, 1)',        // Índigo
              dark: 'rgba(79, 70, 229, 1)',         // Índigo oscuro
              border: 'rgba(255, 255, 255, 0.8)'
            },
            'yape': { 
              light: 'rgba(196, 181, 253, 1)',      // Morado claro brillante
              base: 'rgba(168, 85, 247, 1)',        // Morado vibrante
              dark: 'rgba(147, 51, 234, 1)',        // Morado oscuro
              border: 'rgba(255, 255, 255, 0.8)'
            },
            'plin': { 
              light: 'rgba(167, 139, 250, 1)',      // Morado claro
              base: 'rgba(139, 92, 246, 1)',        // Morado
              dark: 'rgba(124, 58, 237, 1)',       // Morado oscuro
              border: 'rgba(255, 255, 255, 0.8)'
            },
            'transferencia': { 
              light: 'rgba(251, 191, 36, 1)',       // Amarillo claro
              base: 'rgba(245, 158, 11, 1)',       // Amarillo
              dark: 'rgba(217, 119, 6, 1)',        // Amarillo oscuro
              border: 'rgba(255, 255, 255, 0.8)'
            },
            'deposito': { 
              light: 'rgba(249, 168, 212, 1)',      // Rosa claro
              base: 'rgba(236, 72, 153, 1)',        // Rosa
              dark: 'rgba(219, 39, 119, 1)',       // Rosa oscuro
              border: 'rgba(255, 255, 255, 0.8)'
            },
            'credito': { 
              light: 'rgba(248, 113, 113, 1)',      // Rojo claro
              base: 'rgba(239, 68, 68, 1)',         // Rojo
              dark: 'rgba(220, 38, 38, 1)',        // Rojo oscuro
              border: 'rgba(255, 255, 255, 0.8)'
            },
            'cheque': { 
              light: 'rgba(251, 146, 60, 1)',      // Naranja claro
              base: 'rgba(249, 115, 22, 1)',       // Naranja
              dark: 'rgba(234, 88, 12, 1)',        // Naranja oscuro
              border: 'rgba(255, 255, 255, 0.8)'
            }
          };
          
          // Colores de respaldo mejorados
          const fallbackColors = [
            { light: 'rgba(129, 140, 248, 1)', base: 'rgba(99, 102, 241, 1)', dark: 'rgba(79, 70, 229, 1)', border: 'rgba(255, 255, 255, 0.8)' },
            { light: 'rgba(94, 234, 212, 1)', base: 'rgba(20, 184, 166, 1)', dark: 'rgba(15, 118, 110, 1)', border: 'rgba(255, 255, 255, 0.8)' },
            { light: 'rgba(196, 181, 253, 1)', base: 'rgba(168, 85, 247, 1)', dark: 'rgba(147, 51, 234, 1)', border: 'rgba(255, 255, 255, 0.8)' },
            { light: 'rgba(251, 146, 60, 1)', base: 'rgba(249, 115, 22, 1)', dark: 'rgba(234, 88, 12, 1)', border: 'rgba(255, 255, 255, 0.8)' },
            { light: 'rgba(56, 189, 248, 1)', base: 'rgba(14, 165, 233, 1)', dark: 'rgba(2, 132, 199, 1)', border: 'rgba(255, 255, 255, 0.8)' }
          ];
          
          // Función para crear gradiente radial 3D
          const create3DGradient = (ctx, x, y, radius, colors) => {
            // Validar que todos los parámetros sean números finitos
            if (!isFinite(x) || !isFinite(y) || !isFinite(radius) || radius <= 0) {
              return colors.base;
            }
            
            // Asegurar que el radio sea un número positivo válido
            const validRadius = Math.max(radius, 1);
            
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, validRadius);
            gradient.addColorStop(0, colors.light);   // Centro brillante (luz)
            gradient.addColorStop(0.5, colors.base);   // Medio
            gradient.addColorStop(1, colors.dark);    // Borde oscuro (sombra)
            return gradient;
          };
          
          // Función para obtener los colores según el método de pago
          const getColorsForMetodo = (metodo, index) => {
            const metodoLower = (metodo || '').toLowerCase().trim();
            if (metodoPagoColors[metodoLower]) {
              return metodoPagoColors[metodoLower];
            }
            const fallbackIndex = (index - Object.keys(metodoPagoColors).length) % fallbackColors.length;
            return fallbackColors[fallbackIndex >= 0 ? fallbackIndex : 0];
          };
          
          const chartData = {
            labels: data.ingresos_por_metodo.map(item => item.metodo_pago),
            datasets: [
              {
                label: 'Ingresos por Método de Pago',
                data: data.ingresos_por_metodo.map(item => Number(item.total_ingresos) || 0),
                backgroundColor: (context) => {
                  const chart = context.chart;
                  const { ctx, chartArea } = chart;
                  if (!chartArea) {
                    const index = context.dataIndex;
                    const metodo = data.ingresos_por_metodo[index]?.metodo_pago;
                    const colors = getColorsForMetodo(metodo, index);
                    return colors.base;
                  }
                  
                  const index = context.dataIndex;
                  const metodo = data.ingresos_por_metodo[index]?.metodo_pago;
                  const colors = getColorsForMetodo(metodo, index);
                  
                  // Calcular posición del centro del segmento
                  const meta = chart.getDatasetMeta(0);
                  const arc = meta.data[index];
                  if (!arc) return colors.base;
                  
                  const { x, y, innerRadius, outerRadius } = arc;
                  
                  // Validar que todos los valores sean números finitos
                  if (!isFinite(x) || !isFinite(y) || !isFinite(innerRadius) || !isFinite(outerRadius)) {
                    return colors.base;
                  }
                  
                  const centerX = x;
                  const centerY = y;
                  const radius = Math.max((innerRadius + outerRadius) / 2, 1); // Asegurar radio mínimo de 1
                  
                  // Validar que el radio sea finito y positivo
                  if (!isFinite(radius) || radius <= 0) {
                    return colors.base;
                  }
                  
                  try {
                    return create3DGradient(ctx, centerX, centerY, radius, colors);
                  } catch (error) {
                    // Si hay error al crear el gradiente, retornar color base
                    console.warn('Error creating gradient:', error);
                    return colors.base;
                  }
                },
                borderColor: (context) => {
                  const index = context.dataIndex;
                  const metodo = data.ingresos_por_metodo[index]?.metodo_pago;
                  const colors = getColorsForMetodo(metodo, index);
                  return colors.border;
                },
                borderWidth: 4,
                hoverOffset: 20,
                hoverBorderWidth: 6,
                shadowOffsetX: 0,
                shadowOffsetY: 8,
                shadowBlur: 20,
                shadowColor: 'rgba(0, 0, 0, 0.4)'
              }
            ]
          };

          const options = {
            ...chartOptions,
            animation: {
              animateRotate: true,
              animateScale: true,
              duration: 2000,
              easing: 'easeOutQuart'
            },
            rotation: -90,
            circumference: 360,
            cutout: '65%', // Más delgado para mejor efecto 3D
            radius: '90%', // Más grande para mejor visualización
            plugins: {
              ...chartOptions.plugins,
              legend: {
                position: 'bottom',
                labels: {
                  font: {
                    size: 12,
                    weight: 'bold'
                  },
                  padding: 15,
                  usePointStyle: true,
                  pointStyle: 'circle',
                  color: '#ffffff' // Color blanco para las etiquetas
                }
              },
              tooltip: {
                ...chartOptions.plugins.tooltip,
                callbacks: {
                  label: function(context) {
                    const label = context.label || '';
                    const value = context.parsed !== null && context.parsed !== undefined 
                      ? context.parsed 
                      : (context.dataset.data[context.dataIndex] || 0);
                    const formattedValue = Number(value).toLocaleString('es-PE', { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    });
                    return `${label}: S/ ${formattedValue}`;
                  }
                }
              }
            }
          };

          return (
            <div className="relative" style={{
              perspective: '1500px',
              transformStyle: 'preserve-3d',
              width: '100%',
              height: '100%'
            }}>
              <div 
                className="chart-3d-container-financiero"
                style={{
                  transform: 'rotateY(-15deg) rotateX(8deg) translateZ(15px)',
                  transformStyle: 'preserve-3d',
                  animation: 'float3DFinanciero 12s ease-in-out infinite',
                  width: '100%',
                  height: '100%'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.animation = 'rotate3DFinanciero 8s ease-in-out infinite';
                  e.currentTarget.style.transform = 'rotateY(-12deg) rotateX(10deg) translateZ(25px) scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.animation = 'float3DFinanciero 12s ease-in-out infinite';
                  e.currentTarget.style.transform = 'rotateY(-15deg) rotateX(8deg) translateZ(15px) scale(1)';
                }}
              >
                <Doughnut data={chartData} options={options} />
              </div>
              <style>{`
                .chart-3d-container-financiero {
                  filter: drop-shadow(0 15px 30px rgba(0, 0, 0, 0.4)) 
                          drop-shadow(0 8px 16px rgba(59, 130, 246, 0.3));
                  will-change: auto;
                  transition: all 0.3s ease;
                }
                .chart-3d-container-financiero canvas {
                  filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.3))
                          drop-shadow(0 5px 10px rgba(59, 130, 246, 0.2));
                  transition: filter 0.3s ease;
                  border-radius: 50%;
                }
                .chart-3d-container-financiero:hover canvas {
                  filter: drop-shadow(0 15px 30px rgba(0, 0, 0, 0.4))
                          drop-shadow(0 8px 16px rgba(59, 130, 246, 0.3));
                }
                @keyframes float3D {
                  0%, 100% {
                    transform: rotateY(-15deg) rotateX(8deg) translateY(0px);
                  }
                  25% {
                    transform: rotateY(-12deg) rotateX(10deg) translateY(-5px);
                  }
                  50% {
                    transform: rotateY(-18deg) rotateX(6deg) translateY(0px);
                  }
                  75% {
                    transform: rotateY(-12deg) rotateX(10deg) translateY(-5px);
                  }
                }
                @keyframes rotate3D {
                  0% {
                    transform: rotateY(-10deg) rotateX(10deg) rotateZ(0deg) scale(1.08);
                  }
                  25% {
                    transform: rotateY(-5deg) rotateX(12deg) rotateZ(1deg) scale(1.08);
                  }
                  50% {
                    transform: rotateY(-15deg) rotateX(8deg) rotateZ(-1deg) scale(1.08);
                  }
                  75% {
                    transform: rotateY(-5deg) rotateX(12deg) rotateZ(1deg) scale(1.08);
                  }
                  100% {
                    transform: rotateY(-10deg) rotateX(10deg) rotateZ(0deg) scale(1.08);
                  }
                }
                @keyframes pulse3D {
                  0%, 100% {
                    filter: drop-shadow(0 25px 50px rgba(0, 0, 0, 0.5)) 
                            drop-shadow(0 15px 30px rgba(59, 130, 246, 0.4));
                  }
                  50% {
                    filter: drop-shadow(0 30px 60px rgba(0, 0, 0, 0.6)) 
                            drop-shadow(0 20px 40px rgba(59, 130, 246, 0.6));
                  }
                }
                @keyframes float3DFinanciero {
                  0%, 100% {
                    transform: rotateY(-15deg) rotateX(8deg) translateZ(15px) translateY(0px);
                  }
                  50% {
                    transform: rotateY(-13deg) rotateX(10deg) translateZ(18px) translateY(-3px);
                  }
                }
                @keyframes rotate3DFinanciero {
                  0%, 100% {
                    transform: rotateY(-12deg) rotateX(10deg) translateZ(25px) scale(1.05);
                  }
                  50% {
                    transform: rotateY(-10deg) rotateX(12deg) translateZ(28px) scale(1.05);
                  }
                }
              `}</style>
            </div>
          );
        }
        break;

      default:
        return (
          <div className="h-48 sm:h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl mb-2">📈</div>
              <p className="text-xs sm:text-sm text-gray-600">Gráfico no disponible para este tipo de reporte</p>
            </div>
          </div>
        );
    }

    return (
      <div className="h-48 sm:h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl sm:text-4xl mb-2">📈</div>
          <p className="text-xs sm:text-sm text-gray-600">No hay datos suficientes para generar el gráfico</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-48 sm:h-64 relative" style={{
      filter: 'drop-shadow(0 10px 20px rgba(0, 0, 0, 0.3))',
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(34, 197, 94, 0.05) 100%)',
        borderRadius: '8px',
        pointerEvents: 'none',
        zIndex: 0
      }}></div>
      <div style={{ position: 'relative', zIndex: 1 }}>
        {renderChart()}
      </div>
    </div>
  );
};

export default ReportChart; 