'use client';

import { useState } from 'react';
import { fetchMenu } from '@/lib/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [loadingClient, setLoadingClient] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

  // Función para generar el PDF del menú
  const generateMenuPDF = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess('');

      // Obtener todos los productos del menú
      const menuData = await fetchMenu();
      const products = menuData.data || [];

      if (products.length === 0) {
        setError('No hay productos en el menú para generar el reporte');
        setLoading(false);
        return;
      }

      // Agrupar productos por categoría
      const categorizedProducts = products.reduce((acc, product) => {
        const category = product.category || 'Sin categoría';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(product);
        return acc;
      }, {});

      // Crear el PDF
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      let currentY = margin;

      // Colores del tema
      const primaryColor = [234, 88, 12]; // Orange-600
      const secondaryColor = [249, 115, 22]; // Orange-500
      const darkColor = [38, 38, 38]; // Neutral-800
      const grayColor = [107, 114, 128]; // Gray-500

      // ============ PORTADA ============
      // Fondo decorativo superior
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, pageWidth, 80, 'F');
      
      // Franja decorativa
      doc.setFillColor(...secondaryColor);
      doc.rect(0, 70, pageWidth, 15, 'F');

      // Título del restaurante
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(42);
      doc.setFont('helvetica', 'bold');
      doc.text('BOCATTO', pageWidth / 2, 40, { align: 'center' });
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'normal');
      doc.text('R E S T A U R A N T E', pageWidth / 2, 55, { align: 'center' });

      // Subtítulo
      doc.setTextColor(...darkColor);
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.text('Menú', pageWidth / 2, 110, { align: 'center' });

      // Línea decorativa
      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(1);
      doc.line(pageWidth / 2 - 30, 118, pageWidth / 2 + 30, 118);

      // Descripción
      doc.setFontSize(12);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(...grayColor);
      doc.text('Descubre nuestra selección de platos', pageWidth / 2, 130, { align: 'center' });
      doc.text('preparados con los mejores ingredientes', pageWidth / 2, 138, { align: 'center' });

      // Información de categorías
      const categoryNames = Object.keys(categorizedProducts);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`${categoryNames.length} Categorías • ${products.length} Productos`, pageWidth / 2, 160, { align: 'center' });

      // Fecha de generación
      const currentDate = new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      doc.setFontSize(9);
      doc.text(`Generado el ${currentDate}`, pageWidth / 2, pageHeight - 20, { align: 'center' });

      // Pie de página decorativo
      doc.setFillColor(...primaryColor);
      doc.rect(0, pageHeight - 10, pageWidth, 10, 'F');

      // ============ PÁGINAS DEL MENÚ ============
      doc.addPage();

      // Función para agregar encabezado a cada página
      const addPageHeader = () => {
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, pageWidth, 20, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('BOCATTO - Menú', pageWidth / 2, 13, { align: 'center' });
        return 30;
      };

      // Función para agregar pie de página
      const addPageFooter = (pageNum) => {
        doc.setFillColor(...primaryColor);
        doc.rect(0, pageHeight - 10, pageWidth, 10, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.text(`Página ${pageNum}`, pageWidth / 2, pageHeight - 4, { align: 'center' });
      };

      let pageNum = 1;
      currentY = addPageHeader();

      // Iterar sobre cada categoría
      for (const [category, categoryProducts] of Object.entries(categorizedProducts)) {
        // Verificar si hay espacio suficiente para el título de categoría
        if (currentY > pageHeight - 60) {
          addPageFooter(pageNum);
          doc.addPage();
          pageNum++;
          currentY = addPageHeader();
        }

        // Título de categoría con diseño elegante
        doc.setFillColor(254, 243, 199); // Amber-100
        doc.roundedRect(margin, currentY - 5, pageWidth - (margin * 2), 14, 3, 3, 'F');
        
        // Línea decorativa izquierda
        doc.setFillColor(...primaryColor);
        doc.rect(margin, currentY - 5, 4, 14, 'F');
        
        doc.setTextColor(...primaryColor);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(category.toUpperCase(), margin + 10, currentY + 5);
        
        doc.setTextColor(...grayColor);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`${categoryProducts.length} productos`, pageWidth - margin - 5, currentY + 5, { align: 'right' });
        
        currentY += 18;

        // Productos de esta categoría
        for (const product of categoryProducts) {
          // Verificar espacio para producto
          if (currentY > pageHeight - 40) {
            addPageFooter(pageNum);
            doc.addPage();
            pageNum++;
            currentY = addPageHeader();
          }

          // Contenedor del producto con borde sutil
          doc.setDrawColor(229, 231, 235); // Gray-200
          doc.setLineWidth(0.3);
          doc.roundedRect(margin, currentY - 2, pageWidth - (margin * 2), 22, 2, 2, 'S');

          // Indicador de disponibilidad
          if (product.available) {
            doc.setFillColor(34, 197, 94); // Green-500
          } else {
            doc.setFillColor(239, 68, 68); // Red-500
          }
          doc.circle(margin + 5, currentY + 8, 2, 'F');

          // Nombre del producto
          doc.setTextColor(...darkColor);
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          const productName = product.name.length > 40 ? product.name.substring(0, 37) + '...' : product.name;
          doc.text(productName, margin + 12, currentY + 6);

          // Precio
          doc.setTextColor(...primaryColor);
          doc.setFontSize(13);
          doc.setFont('helvetica', 'bold');
          const price = `$${product.price.toFixed(2)}`;
          doc.text(price, pageWidth - margin - 5, currentY + 6, { align: 'right' });

          // Descripción
          doc.setTextColor(...grayColor);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          const description = product.description ? 
            (product.description.length > 80 ? product.description.substring(0, 77) + '...' : product.description) : 
            '';
          doc.text(description, margin + 12, currentY + 14);

          // Ingredientes (si existen y caben)
          if (product.ingredients && product.ingredients.length > 0) {
            const ingredientsText = `Ingredientes: ${product.ingredients.slice(0, 5).join(', ')}${product.ingredients.length > 5 ? '...' : ''}`;
            doc.setFontSize(7);
            doc.setTextColor(156, 163, 175); // Gray-400
            const truncatedIngredients = ingredientsText.length > 90 ? ingredientsText.substring(0, 87) + '...' : ingredientsText;
            doc.text(truncatedIngredients, margin + 12, currentY + 19);
          }

          currentY += 26;
        }

        currentY += 8; // Espacio entre categorías
      }

      // Agregar pie de página a la última página
      addPageFooter(pageNum);

      // ============ PÁGINA DE RESUMEN ============
      doc.addPage();
      pageNum++;
      currentY = addPageHeader();

      // Título de resumen
      doc.setTextColor(...darkColor);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Resumen del Menú', pageWidth / 2, currentY + 10, { align: 'center' });
      currentY += 25;

      // Tabla de resumen por categoría
      const summaryData = Object.entries(categorizedProducts).map(([category, products]) => {
        const availableCount = products.filter(p => p.available).length;
        const avgPrice = products.reduce((acc, p) => acc + p.price, 0) / products.length;
        const minPrice = Math.min(...products.map(p => p.price));
        const maxPrice = Math.max(...products.map(p => p.price));
        
        return [
          category,
          products.length.toString(),
          availableCount.toString(),
          `$${minPrice.toFixed(2)}`,
          `$${maxPrice.toFixed(2)}`,
          `$${avgPrice.toFixed(2)}`
        ];
      });

      autoTable(doc, {
        startY: currentY,
        head: [['Categoría', 'Total', 'Disponibles', 'Precio Mín.', 'Precio Máx.', 'Precio Prom.']],
        body: summaryData,
        theme: 'striped',
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center'
        },
        styles: {
          fontSize: 10,
          cellPadding: 4,
          halign: 'center'
        },
        alternateRowStyles: {
          fillColor: [254, 249, 238] // Warm white
        },
        margin: { left: margin, right: margin }
      });

      // Totales generales
      const finalY = doc.lastAutoTable.finalY + 15;
      const totalProducts = products.length;
      const totalAvailable = products.filter(p => p.available).length;
      const totalUnavailable = totalProducts - totalAvailable;

      doc.setFillColor(254, 243, 199); // Amber-100
      doc.roundedRect(margin, finalY, pageWidth - (margin * 2), 40, 4, 4, 'F');

      doc.setTextColor(...darkColor);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Estadísticas Generales', pageWidth / 2, finalY + 10, { align: 'center' });

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total de Productos: ${totalProducts}`, margin + 20, finalY + 22);
      doc.text(`Productos Disponibles: ${totalAvailable}`, pageWidth / 2 - 10, finalY + 22);
      doc.text(`No Disponibles: ${totalUnavailable}`, pageWidth - margin - 50, finalY + 22);

      doc.setFontSize(10);
      doc.text(`Categorías: ${categoryNames.length}`, margin + 20, finalY + 32);
      
      const allPrices = products.map(p => p.price);
      const avgGeneralPrice = allPrices.reduce((a, b) => a + b, 0) / allPrices.length;
      doc.text(`Precio Promedio General: $${avgGeneralPrice.toFixed(2)}`, pageWidth / 2 - 10, finalY + 32);

      addPageFooter(pageNum);

      // Guardar el PDF
      const fileName = `Menu_Bocatto_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      setSuccess(`Reporte del menú generado exitosamente: ${fileName}`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError('Error al generar el reporte del menú: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Función para generar el PDF del menú para clientes (solo productos disponibles)
  const generateClientMenuPDF = async () => {
    try {
      setLoadingClient(true);
      setError(null);
      setSuccess('');

      // Obtener todos los productos del menú
      const menuData = await fetchMenu();
      const allProducts = menuData.data || [];
      
      // Filtrar solo productos disponibles
      const products = allProducts.filter(p => p.available);

      if (products.length === 0) {
        setError('No hay productos disponibles en el menú para generar el reporte');
        setLoadingClient(false);
        return;
      }

      // Agrupar productos por categoría
      const categorizedProducts = products.reduce((acc, product) => {
        const category = product.category || 'Sin categoría';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(product);
        return acc;
      }, {});

      // Crear el PDF
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      let currentY = margin;

      // Colores del tema
      const primaryColor = [234, 88, 12]; // Orange-600
      const secondaryColor = [249, 115, 22]; // Orange-500
      const darkColor = [38, 38, 38]; // Neutral-800
      const grayColor = [107, 114, 128]; // Gray-500

      // ============ PORTADA ELEGANTE PARA CLIENTES ============
      // Fondo decorativo superior
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, pageWidth, 90, 'F');
      
      // Franja decorativa
      doc.setFillColor(...secondaryColor);
      doc.rect(0, 80, pageWidth, 15, 'F');

      // Título del restaurante
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(48);
      doc.setFont('helvetica', 'bold');
      doc.text('BOCATTO', pageWidth / 2, 45, { align: 'center' });
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text('R E S T A U R A N T E', pageWidth / 2, 60, { align: 'center' });

      // Subtítulo
      doc.setTextColor(...darkColor);
      doc.setFontSize(32);
      doc.setFont('helvetica', 'bold');
      doc.text('Nuestro Menu', pageWidth / 2, 120, { align: 'center' });

      // Línea decorativa doble
      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(0.8);
      doc.line(pageWidth / 2 - 40, 130, pageWidth / 2 + 40, 130);
      doc.setLineWidth(0.4);
      doc.line(pageWidth / 2 - 30, 134, pageWidth / 2 + 30, 134);

      // Descripción
      doc.setFontSize(12);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(...grayColor);
      doc.text('Disfruta de nuestra exquisita seleccion', pageWidth / 2, 150, { align: 'center' });
      doc.text('de platillos preparados con amor', pageWidth / 2, 158, { align: 'center' });

      // Información
      const categoryNames = Object.keys(categorizedProducts);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...darkColor);
      doc.text(`${categoryNames.length} Categorias  -  ${products.length} Deliciosos Platillos`, pageWidth / 2, 180, { align: 'center' });

      // Pie de página decorativo
      doc.setFillColor(...primaryColor);
      doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text('Buen Provecho!', pageWidth / 2, pageHeight - 6, { align: 'center' });

      // ============ PÁGINAS DEL MENÚ ============
      doc.addPage();

      // Función para agregar encabezado a cada página
      const addPageHeader = () => {
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, pageWidth, 18, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('BOCATTO - Menu', pageWidth / 2, 12, { align: 'center' });
        return 28;
      };

      // Función para agregar pie de página
      const addPageFooter = (pageNum) => {
        doc.setFillColor(...primaryColor);
        doc.rect(0, pageHeight - 8, pageWidth, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.text(`- ${pageNum} -`, pageWidth / 2, pageHeight - 3, { align: 'center' });
      };

      let pageNum = 1;
      currentY = addPageHeader();

      // Iterar sobre cada categoría
      for (const [category, categoryProducts] of Object.entries(categorizedProducts)) {
        // Verificar si hay espacio suficiente para el título de categoría
        if (currentY > pageHeight - 50) {
          addPageFooter(pageNum);
          doc.addPage();
          pageNum++;
          currentY = addPageHeader();
        }

        // Título de categoría elegante
        doc.setFillColor(254, 243, 199); // Amber-100
        doc.roundedRect(margin, currentY - 4, pageWidth - (margin * 2), 12, 2, 2, 'F');
        
        // Línea decorativa
        doc.setFillColor(...primaryColor);
        doc.rect(margin, currentY - 4, 3, 12, 'F');
        
        doc.setTextColor(...primaryColor);
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text(category.toUpperCase(), margin + 8, currentY + 4);
        
        currentY += 16;

        // Productos de esta categoría
        for (const product of categoryProducts) {
          // Verificar espacio para producto
          if (currentY > pageHeight - 30) {
            addPageFooter(pageNum);
            doc.addPage();
            pageNum++;
            currentY = addPageHeader();
          }

          // Nombre del producto y línea punteada hasta el precio
          doc.setTextColor(...darkColor);
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          const productName = product.name.length > 45 ? product.name.substring(0, 42) + '...' : product.name;
          doc.text(productName, margin + 3, currentY);

          // Precio
          doc.setTextColor(...primaryColor);
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          const price = `$${product.price.toFixed(2)}`;
          doc.text(price, pageWidth - margin - 3, currentY, { align: 'right' });

          // Línea punteada entre nombre y precio
          const nameWidth = doc.getTextWidth(productName);
          const priceWidth = doc.getTextWidth(price);
          const lineStart = margin + 3 + nameWidth + 3;
          const lineEnd = pageWidth - margin - 3 - priceWidth - 3;
          
          if (lineEnd > lineStart + 10) {
            doc.setDrawColor(200, 200, 200);
            doc.setLineDashPattern([1, 2], 0);
            doc.line(lineStart, currentY - 1, lineEnd, currentY - 1);
            doc.setLineDashPattern([], 0);
          }

          // Descripción corta
          if (product.description) {
            doc.setTextColor(...grayColor);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'italic');
            const description = product.description.length > 70 ? product.description.substring(0, 67) + '...' : product.description;
            doc.text(description, margin + 3, currentY + 5);
            currentY += 14;
          } else {
            currentY += 10;
          }
        }

        currentY += 6; // Espacio entre categorías
      }

      // Agregar pie de página a la última página
      addPageFooter(pageNum);

      // Guardar el PDF
      const fileName = `Menu_Clientes_Bocatto_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      setSuccess(`Menu para clientes generado exitosamente: ${fileName}`);
    } catch (err) {
      console.error('Error generating client PDF:', err);
      setError('Error al generar el menu para clientes: ' + err.message);
    } finally {
      setLoadingClient(false);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Reportes</h2>
        <p className="text-gray-800 font-medium mt-1">Genera reportes y documentos del sistema</p>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <span className="text-2xl">❌</span>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <span className="text-2xl">✅</span>
          <p className="text-green-700">{success}</p>
        </div>
      )}

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Reporte de Menú */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl">📋</span>
            </div>
            <h3 className="text-xl font-bold text-white">Menú Completo</h3>
            <p className="text-orange-100 text-sm mt-1">PDF del menú para QR</p>
          </div>
          <div className="p-6">
            <p className="text-gray-600 text-sm mb-4">
              Genera un PDF atractivo con todos los productos del menú, organizados por categorías. 
              Ideal para imprimir o usar con códigos QR.
            </p>
            <ul className="text-sm text-gray-500 mb-4 space-y-1">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Productos organizados por categoría
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Precios y descripciones
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Estado de disponibilidad
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Resumen estadístico
              </li>
            </ul>
            <button
              onClick={generateMenuPDF}
              disabled={loading}
              className="w-full px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-orange-300 disabled:cursor-not-allowed transition font-medium flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Generando...</span>
                </>
              ) : (
                <>
                  <span className="text-xl">📥</span>
                  <span>Descargar PDF</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Reporte de Menú para Clientes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl">🍽️</span>
            </div>
            <h3 className="text-xl font-bold text-white">Menú Clientes</h3>
            <p className="text-green-100 text-sm mt-1">PDF listo para pedir</p>
          </div>
          <div className="p-6">
            <p className="text-gray-600 text-sm mb-4">
              Menú limpio y elegante solo con productos disponibles. 
              Perfecto para que los clientes hagan su pedido.
            </p>
            <ul className="text-sm text-gray-500 mb-4 space-y-1">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Solo productos disponibles
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Diseño elegante y limpio
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Precios y descripciones
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Ideal para código QR
              </li>
            </ul>
            <button
              onClick={generateClientMenuPDF}
              disabled={loadingClient}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed transition font-medium flex items-center justify-center gap-2"
            >
              {loadingClient ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Generando...</span>
                </>
              ) : (
                <>
                  <span className="text-xl">📥</span>
                  <span>Descargar PDF</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Placeholder para futuros reportes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden opacity-60">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl">📊</span>
            </div>
            <h3 className="text-xl font-bold text-white">Reporte de Ventas</h3>
            <p className="text-blue-100 text-sm mt-1">Próximamente</p>
          </div>
          <div className="p-6">
            <p className="text-gray-600 text-sm mb-4">
              Reporte detallado de ventas con gráficos y estadísticas de los productos más vendidos.
            </p>
            <button
              disabled
              className="w-full px-4 py-3 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed font-medium flex items-center justify-center gap-2"
            >
              <span className="text-xl">🔒</span>
              <span>Próximamente</span>
            </button>
          </div>
        </div>
      </div>

      {/* Info section */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <span className="text-3xl">💡</span>
          <div>
            <h4 className="font-semibold text-blue-800 mb-2">Consejo para Códigos QR</h4>
            <p className="text-blue-700 text-sm">
              Una vez descargado el PDF del menú, puedes subirlo a servicios como Google Drive, Dropbox o 
              tu propio servidor web. Luego, genera un código QR con el enlace compartido para que tus 
              clientes puedan escanear y ver el menú en sus dispositivos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
