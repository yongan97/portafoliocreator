import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import fs from 'fs';
import path from 'path';
import { createCanvas } from 'canvas';

interface ExportRequest {
  clientName: string;
  riskProfile: string;
  instruments: Array<{
    symbol: string;
    name: string;
    percentage: number;
    category?: string;
  }>;
  analysis: {
    summary: string;
    instrumentDetails: Array<{
      symbol: string;
      name: string;
      description: string;
      sector?: string;
    }>;
  };
}

/**
 * Genera un gráfico de torta usando Canvas con leyenda a la derecha
 */
function generatePieChart(instruments: Array<{ symbol: string; name: string; percentage: number; category?: string }>): string {
  const canvas = createCanvas(600, 400);
  const ctx = canvas.getContext('2d');

  // Fondo blanco
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, 600, 400);

  // Colores VetaCap y variaciones
  const colors = [
    '#1036E2', // Azul Impulso
    '#00C600', // Verde Activo
    '#021751', // Azul Respaldo
    '#4A7FFF', // Azul Claro (variación de Impulso)
    '#33DD33', // Verde Claro (variación de Activo)
    '#0A2F99', // Azul Medio (variación de Respaldo)
    '#7099FF', // Azul Más Claro
    '#66EE66', // Verde Más Claro
    '#152F66', // Azul Más Oscuro
    '#1A5FCC', // Azul Intermedio
  ];

  // Centro del gráfico (más a la izquierda para dar espacio a la leyenda)
  const centerX = 180;
  const centerY = 200;
  const radius = 140;

  // Calcular ángulos y dibujar segmentos
  let currentAngle = -Math.PI / 2; // Empezar desde arriba

  instruments.forEach((inst, index) => {
    const sliceAngle = (inst.percentage / 100) * 2 * Math.PI;
    const color = colors[index % colors.length];

    // Dibujar segmento
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
    ctx.closePath();
    ctx.fill();

    // Borde blanco entre segmentos
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Etiqueta en el centro del segmento
    const labelAngle = currentAngle + sliceAngle / 2;
    const labelRadius = radius * 0.7;
    const labelX = centerX + Math.cos(labelAngle) * labelRadius;
    const labelY = centerY + Math.sin(labelAngle) * labelRadius;

    // Texto de la etiqueta (ticker y porcentaje)
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Sombra para mejor legibilidad
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;

    ctx.fillText(`${inst.symbol}`, labelX, labelY - 8);
    ctx.font = 'bold 12px Arial';
    ctx.fillText(`${inst.percentage.toFixed(1)}%`, labelX, labelY + 8);

    // Resetear sombra
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    currentAngle += sliceAngle;
  });

  // Leyenda a la derecha
  const legendX = 380;
  let legendY = 80;
  const lineHeight = 20;

  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  instruments.forEach((inst, index) => {
    const color = colors[index % colors.length];

    // Cuadrado de color
    ctx.fillStyle = color;
    ctx.fillRect(legendX, legendY - 6, 14, 14);

    // Borde del cuadrado
    ctx.strokeStyle = '#CCCCCC';
    ctx.lineWidth = 1;
    ctx.strokeRect(legendX, legendY - 6, 14, 14);

    // Texto: ticker
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 12px Arial';
    ctx.fillText(`${inst.symbol}`, legendX + 20, legendY);

    // Texto: porcentaje
    ctx.font = '11px Arial';
    ctx.fillText(`${inst.percentage.toFixed(1)}%`, legendX + 100, legendY);

    legendY += lineHeight;
  });

  return canvas.toDataURL('image/png');
}

/**
 * Genera un PDF profesional con diseño VetaCap
 * POST /api/portfolio/export-pdf
 */
export async function POST(request: NextRequest) {
  try {
    const body: ExportRequest = await request.json();
    const { clientName, riskProfile, instruments, analysis } = body;

    // Crear documento PDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Colores VetaCap
    const colors = {
      azulImpulso: [16, 54, 226] as [number, number, number],
      azulRespaldo: [2, 23, 81] as [number, number, number],
      verdeActivo: [0, 198, 0] as [number, number, number],
      gris: [128, 128, 128] as [number, number, number],
      grisClaro: [240, 240, 240] as [number, number, number],
      blanco: [255, 255, 255] as [number, number, number],
      negro: [0, 0, 0] as [number, number, number],
    };

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    // ========== PÁGINA 1: PORTADA Y RESUMEN ==========

    // Fondo de encabezado más fino
    doc.setFillColor(...colors.azulRespaldo);
    doc.rect(0, 0, pageWidth, 35, 'F');

    // Línea de acento verde
    doc.setFillColor(...colors.verdeActivo);
    doc.rect(0, 33, pageWidth, 2, 'F');

    // Logo VetaCap (imagen)
    try {
      const logoPath = path.join(process.cwd(), 'public', 'logos', 'vetacap-logo-oficial.png');
      const logoBase64 = fs.readFileSync(logoPath).toString('base64');

      // Dimensiones originales del logo: aproximadamente 700x150 pixels
      // Ratio: 700/150 = 4.67 (ancho es 4.67 veces el alto)
      const logoHeight = 10; // mm más pequeño
      const logoWidth = logoHeight * 4.67; // Mantener proporción

      doc.addImage(`data:image/png;base64,${logoBase64}`, 'PNG', margin, 12, logoWidth, logoHeight);
    } catch (error) {
      // Fallback a texto si no se encuentra la imagen
      doc.setTextColor(...colors.blanco);
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.text('VETACAP', margin, 28);
    }

    yPosition = 45;

    // Título del documento en card más compacto
    doc.setFillColor(...colors.azulImpulso);
    doc.roundedRect(margin, yPosition, contentWidth, 12, 2, 2, 'F');
    doc.setTextColor(...colors.blanco);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Propuesta de Portafolio', margin + 4, yPosition + 8);
    yPosition += 15;

    // Card de información del cliente más compacto (una línea)
    doc.setFillColor(...colors.grisClaro);
    doc.roundedRect(margin, yPosition, contentWidth, 10, 2, 2, 'F');

    yPosition += 7;
    doc.setFontSize(8);
    doc.setTextColor(...colors.negro);
    doc.setFont('helvetica', 'bold');
    doc.text('Cliente:', margin + 3, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(clientName, margin + 18, yPosition);

    doc.setFont('helvetica', 'bold');
    doc.text('Perfil:', margin + 70, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(riskProfile.charAt(0).toUpperCase() + riskProfile.slice(1), margin + 85, yPosition);

    doc.setFont('helvetica', 'bold');
    doc.text('Fecha:', margin + 130, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date().toLocaleDateString('es-AR'), margin + 144, yPosition);

    yPosition += 8;

    // Sección: Composición de la Cartera con barra lateral
    doc.setFillColor(...colors.azulImpulso);
    doc.rect(margin, yPosition, 3, 7, 'F');
    doc.setFontSize(12);
    doc.setTextColor(...colors.azulImpulso);
    doc.setFont('helvetica', 'bold');
    doc.text('Composición de la Cartera', margin + 5, yPosition + 5);
    yPosition += 12; // Espacio entre subtítulo y tabla

    // Tabla de instrumentos más compacta
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');

    // Encabezados de tabla con estilo mejorado
    doc.setFillColor(...colors.azulRespaldo);
    doc.roundedRect(margin, yPosition - 4, contentWidth, 7, 1, 1, 'F');
    doc.setTextColor(...colors.blanco);
    doc.setFont('helvetica', 'bold');
    doc.text('Símbolo', margin + 2, yPosition);
    doc.text('Nombre', margin + 25, yPosition);
    doc.text('Categoría', margin + 90, yPosition);
    doc.text('%', margin + 135, yPosition);
    yPosition += 8;

    // Filas de instrumentos con mejor separación
    doc.setFont('helvetica', 'normal');
    instruments.forEach((inst, index) => {
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = margin;
      }

      // Alternar color de fondo con tonos suaves
      if (index % 2 === 0) {
        doc.setFillColor(248, 249, 250);
        doc.rect(margin, yPosition - 4, contentWidth, 6, 'F');
      }

      doc.setTextColor(...colors.negro);
      doc.setFontSize(8);

      // Símbolo con link clickeable al PDF del instrumento
      doc.setTextColor(...colors.azulImpulso);
      doc.textWithLink(inst.symbol, margin + 2, yPosition, {
        url: `/api/portfolio/instrument-pdf?symbol=${encodeURIComponent(inst.symbol)}&name=${encodeURIComponent(inst.name)}&category=${encodeURIComponent(inst.category || '')}`
      });

      doc.setTextColor(...colors.negro);
      doc.text(inst.name.substring(0, 32), margin + 25, yPosition);
      doc.text(inst.category || 'N/A', margin + 90, yPosition);

      // Porcentaje con color de acento
      doc.setTextColor(...colors.azulImpulso);
      doc.setFont('helvetica', 'bold');
      doc.text(`${inst.percentage.toFixed(1)}%`, margin + 135, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...colors.negro);

      yPosition += 6;
    });

    yPosition += 5; // Espacio reducido después de la tabla

    // Gráfico de torta con leyenda a la derecha
    try {
      const chartImage = generatePieChart(instruments);
      const chartWidth = 150; // Más ancho para incluir leyenda
      const chartHeight = 100;
      const chartX = (pageWidth - chartWidth) / 2; // Centrar horizontalmente

      doc.addImage(chartImage, 'PNG', chartX, yPosition, chartWidth, chartHeight);
      yPosition += chartHeight + 6; // Espacio reducido después del gráfico
    } catch (error) {
      console.error('Error generating pie chart:', error);
      // Continuar sin el gráfico si hay error
      yPosition += 5;
    }

    // Resumen Ejecutivo compacto
    // Título con barra lateral
    doc.setFillColor(...colors.azulImpulso);
    doc.rect(margin, yPosition, 3, 6, 'F');
    doc.setFontSize(11);
    doc.setTextColor(...colors.azulImpulso);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumen Ejecutivo', margin + 5, yPosition + 4.5);
    yPosition += 9; // Espacio reducido entre subtítulo y card de resumen

    // Card con el contenido del resumen
    const summaryLines = doc.splitTextToSize(analysis.summary, contentWidth - 10);
    const cardHeight = summaryLines.length * 4.5 + 8;

    doc.setFillColor(...colors.grisClaro);
    doc.roundedRect(margin, yPosition, contentWidth, cardHeight, 2, 2, 'F');

    yPosition += 5;
    doc.setFontSize(8);
    doc.setTextColor(...colors.negro);
    doc.setFont('helvetica', 'normal');
    summaryLines.forEach((line: string) => {
      doc.text(line, margin + 4, yPosition);
      yPosition += 4.5;
    });

    yPosition += 5;


    // ========== PIE DE PÁGINA EN TODAS LAS PÁGINAS ==========

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);

      // Línea superior del footer con gradiente visual
      doc.setDrawColor(...colors.verdeActivo);
      doc.setLineWidth(0.5);
      doc.line(margin, pageHeight - 18, pageWidth - margin, pageHeight - 18);

      // Fondo sutil para el footer
      doc.setFillColor(250, 250, 250);
      doc.rect(0, pageHeight - 17, pageWidth, 17, 'F');

      // Texto del footer con mejor distribución
      doc.setFontSize(7);
      doc.setTextColor(...colors.azulRespaldo);
      doc.setFont('helvetica', 'bold');
      doc.text('VetaCap', margin, pageHeight - 10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...colors.gris);
      doc.text('| El foco está en vos', margin + 14, pageHeight - 10);

      // Número de página sin círculo
      doc.setTextColor(...colors.azulRespaldo);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin - 25, pageHeight - 10);

      // Confidencialidad centrada
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.setFont('helvetica', 'italic');
      doc.text('Este documento es confidencial', pageWidth / 2, pageHeight - 10, { align: 'center' });
    }

    // Generar el PDF como Buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    // Retornar como respuesta
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="VetaCap_Portfolio_${clientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf"`,
      },
    });

  } catch (error) {
    console.error('Error generating PDF:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        message: 'Error al generar PDF',
      },
      { status: 500 }
    );
  }
}
