import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import fs from 'fs';
import path from 'path';

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

    // Fondo de encabezado con gradiente visual
    doc.setFillColor(...colors.azulRespaldo);
    doc.rect(0, 0, pageWidth, 55, 'F');

    // Línea de acento verde
    doc.setFillColor(...colors.verdeActivo);
    doc.rect(0, 53, pageWidth, 2, 'F');

    // Logo VetaCap (imagen)
    try {
      const logoPath = path.join(process.cwd(), 'public', 'logos', 'vetacap-logo-oficial.png');
      const logoBase64 = fs.readFileSync(logoPath).toString('base64');

      // Dimensiones originales del logo: aproximadamente 700x150 pixels
      // Ratio: 700/150 = 4.67 (ancho es 4.67 veces el alto)
      const logoHeight = 12; // mm
      const logoWidth = logoHeight * 4.67; // Mantener proporción

      doc.addImage(`data:image/png;base64,${logoBase64}`, 'PNG', margin, 20, logoWidth, logoHeight);
    } catch (error) {
      // Fallback a texto si no se encuentra la imagen
      doc.setTextColor(...colors.blanco);
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.text('VETACAP', margin, 28);
    }

    yPosition = 70;

    // Título del documento en card
    doc.setFillColor(...colors.azulImpulso);
    doc.roundedRect(margin, yPosition, contentWidth, 16, 2, 2, 'F');
    doc.setTextColor(...colors.blanco);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Propuesta de Portafolio', margin + 5, yPosition + 10);
    yPosition += 20;

    // Card de información del cliente
    doc.setFillColor(...colors.grisClaro);
    doc.roundedRect(margin, yPosition, contentWidth, 26, 2, 2, 'F');

    yPosition += 8;
    doc.setFontSize(10);
    doc.setTextColor(...colors.negro);
    doc.setFont('helvetica', 'bold');
    doc.text('Cliente:', margin + 5, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(clientName, margin + 23, yPosition);

    yPosition += 7;
    doc.setFont('helvetica', 'bold');
    doc.text('Perfil de Riesgo:', margin + 5, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(riskProfile.charAt(0).toUpperCase() + riskProfile.slice(1), margin + 33, yPosition);

    yPosition += 7;
    doc.setFont('helvetica', 'bold');
    doc.text('Fecha:', margin + 5, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date().toLocaleDateString('es-AR'), margin + 19, yPosition);

    yPosition += 14;

    // Sección: Composición de la Cartera con barra lateral
    doc.setFillColor(...colors.azulImpulso);
    doc.rect(margin, yPosition, 3, 9, 'F');
    doc.setFontSize(15);
    doc.setTextColor(...colors.azulImpulso);
    doc.setFont('helvetica', 'bold');
    doc.text('Composición de la Cartera', margin + 6, yPosition + 6.5);
    yPosition += 14;

    // Tabla de instrumentos con bordes profesionales
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    // Encabezados de tabla con estilo mejorado
    doc.setFillColor(...colors.azulRespaldo);
    doc.roundedRect(margin, yPosition - 5, contentWidth, 9, 1, 1, 'F');
    doc.setTextColor(...colors.blanco);
    doc.setFont('helvetica', 'bold');
    doc.text('Símbolo', margin + 3, yPosition);
    doc.text('Nombre', margin + 30, yPosition);
    doc.text('Categoría', margin + 100, yPosition);
    doc.text('Porcentaje', margin + 140, yPosition);
    yPosition += 10;

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
        doc.rect(margin, yPosition - 5, contentWidth, 8, 'F');
      }

      doc.setTextColor(...colors.negro);
      doc.setFontSize(9);
      doc.text(inst.symbol, margin + 3, yPosition);
      doc.text(inst.name.substring(0, 35), margin + 30, yPosition);
      doc.text(inst.category || 'N/A', margin + 100, yPosition);

      // Porcentaje con color de acento
      doc.setTextColor(...colors.azulImpulso);
      doc.setFont('helvetica', 'bold');
      doc.text(`${inst.percentage.toFixed(2)}%`, margin + 140, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...colors.negro);

      yPosition += 8;
    });

    yPosition += 5;

    // Total con card destacado
    doc.setFillColor(...colors.verdeActivo);
    doc.roundedRect(margin + 110, yPosition - 3, 60, 10, 2, 2, 'F');
    doc.setTextColor(...colors.blanco);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    const totalPercentage = instruments.reduce((sum, inst) => sum + inst.percentage, 0);
    doc.text(`TOTAL: ${totalPercentage.toFixed(2)}%`, margin + 115, yPosition + 4);
    doc.setTextColor(...colors.negro);
    yPosition += 18;

    // Resumen Ejecutivo con card profesional
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = margin;
    }

    // Título con barra lateral
    doc.setFillColor(...colors.azulImpulso);
    doc.rect(margin, yPosition, 3, 9, 'F');
    doc.setFontSize(15);
    doc.setTextColor(...colors.azulImpulso);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumen Ejecutivo', margin + 6, yPosition + 6.5);
    yPosition += 14;

    // Card con el contenido del resumen
    const summaryLines = doc.splitTextToSize(analysis.summary, contentWidth - 12);
    const cardHeight = summaryLines.length * 5.5 + 12;

    doc.setFillColor(...colors.grisClaro);
    doc.roundedRect(margin, yPosition, contentWidth, cardHeight, 2, 2, 'F');

    yPosition += 8;
    doc.setFontSize(10);
    doc.setTextColor(...colors.negro);
    doc.setFont('helvetica', 'normal');
    summaryLines.forEach((line: string) => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(line, margin + 6, yPosition);
      yPosition += 5.5;
    });

    yPosition += 10;

    // ========== PÁGINA 2: ANÁLISIS DETALLADO ==========

    doc.addPage();
    yPosition = margin;

    // Encabezado de página mejorado
    doc.setFillColor(...colors.azulRespaldo);
    doc.rect(0, 0, pageWidth, 35, 'F');
    doc.setFillColor(...colors.verdeActivo);
    doc.rect(0, 33, pageWidth, 2, 'F');

    doc.setTextColor(...colors.blanco);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Análisis Detallado de Instrumentos', margin, 22);

    yPosition = 45;

    // Análisis de cada instrumento con diseño limpio y profesional
    analysis.instrumentDetails.forEach((inst, index) => {
      if (yPosition > pageHeight - 70) {
        doc.addPage();
        yPosition = margin + 10;
      }

      // Header del instrumento con badge azul
      doc.setFillColor(...colors.azulImpulso);
      doc.roundedRect(margin, yPosition, contentWidth, 11, 2, 2, 'F');
      doc.setFontSize(11);
      doc.setTextColor(...colors.blanco);
      doc.setFont('helvetica', 'bold');
      doc.text(`${inst.symbol}`, margin + 4, yPosition + 7);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`- ${inst.name}`, margin + 4 + doc.getTextWidth(`${inst.symbol}`) + 2, yPosition + 7);
      yPosition += 14;

      // Card contenedor con borde sutil
      const contentStartY = yPosition;

      // Sector badge
      if (inst.sector) {
        doc.setFillColor(...colors.grisClaro);
        doc.roundedRect(margin, yPosition, 55, 6, 1, 1, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(...colors.azulRespaldo);
        doc.text(`CATEGORÍA: ${inst.sector.toUpperCase()}`, margin + 2, yPosition + 4);
        yPosition += 10;
      }

      // Descripción completa con espaciado apropiado
      doc.setFontSize(9);
      doc.setTextColor(...colors.negro);
      doc.setFont('helvetica', 'normal');

      // Dividir el texto en líneas con ancho apropiado
      const descLines = doc.splitTextToSize(inst.description, contentWidth - 4);

      descLines.forEach((line: string, lineIndex: number) => {
        if (yPosition > pageHeight - 25) {
          doc.addPage();
          yPosition = margin + 10;
        }

        // Texto justificado con sangría de primera línea si es el inicio de un párrafo
        const xPos = margin + 2;
        doc.text(line, xPos, yPosition);

        // Interlineado de 4.5mm
        yPosition += 4.5;
      });

      yPosition += 8;

      // Separador elegante entre instrumentos
      if (index < analysis.instrumentDetails.length - 1) {
        doc.setDrawColor(...colors.grisClaro);
        doc.setLineWidth(0.5);
        doc.line(margin + 30, yPosition, pageWidth - margin - 30, yPosition);
        yPosition += 12;
      } else {
        yPosition += 5;
      }
    });


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

      // Número de página en círculo
      doc.setFillColor(...colors.azulImpulso);
      doc.circle(pageWidth - margin - 15, pageHeight - 11, 3, 'F');
      doc.setTextColor(...colors.blanco);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.text(`${i}`, pageWidth - margin - 16.5, pageHeight - 9.5);
      doc.setTextColor(...colors.gris);
      doc.setFont('helvetica', 'normal');
      doc.text(`de ${pageCount}`, pageWidth - margin - 10, pageHeight - 10);

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
