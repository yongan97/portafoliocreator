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
      risks?: string;
      opportunities?: string;
    }>;
    news: Array<{
      title: string;
      summary: string;
      date: string;
      relevantSymbols: string[];
    }>;
    recommendations?: string;
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
      blanco: [255, 255, 255] as [number, number, number],
    };

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;

    // ========== PÁGINA 1: PORTADA Y RESUMEN ==========

    // Fondo de encabezado
    doc.setFillColor(...colors.azulRespaldo);
    doc.rect(0, 0, pageWidth, 50, 'F');

    // Logo VetaCap (imagen)
    try {
      const logoPath = path.join(process.cwd(), 'public', 'logos', 'vetacap-logo-oficial.png');
      const logoBase64 = fs.readFileSync(logoPath).toString('base64');

      // Dimensiones originales del logo: aproximadamente 700x150 pixels
      // Ratio: 700/150 = 4.67 (ancho es 4.67 veces el alto)
      const logoHeight = 12; // mm
      const logoWidth = logoHeight * 4.67; // Mantener proporción

      doc.addImage(`data:image/png;base64,${logoBase64}`, 'PNG', margin, 18, logoWidth, logoHeight);
    } catch (error) {
      // Fallback a texto si no se encuentra la imagen
      doc.setTextColor(...colors.blanco);
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.text('VETACAP', margin, 25);
    }

    yPosition = 60;

    // Título del documento
    doc.setTextColor(...colors.azulImpulso);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Propuesta de Portafolio', margin, yPosition);
    yPosition += 12;

    // Información del cliente
    doc.setFontSize(14);
    doc.setTextColor(...colors.gris);
    doc.setFont('helvetica', 'normal');
    doc.text(`Cliente: ${clientName}`, margin, yPosition);
    yPosition += 8;
    doc.text(`Perfil de Riesgo: ${riskProfile.charAt(0).toUpperCase() + riskProfile.slice(1)}`, margin, yPosition);
    yPosition += 8;
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-AR')}`, margin, yPosition);
    yPosition += 15;

    // Sección: Composición de la Cartera
    doc.setFontSize(18);
    doc.setTextColor(...colors.azulImpulso);
    doc.setFont('helvetica', 'bold');
    doc.text('Composición de la Cartera', margin, yPosition);
    yPosition += 10;

    // Tabla de instrumentos
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    // Encabezados de tabla
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 8, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Símbolo', margin + 3, yPosition);
    doc.text('Nombre', margin + 30, yPosition);
    doc.text('Categoría', margin + 100, yPosition);
    doc.text('Porcentaje', margin + 140, yPosition);
    yPosition += 10;

    // Filas de instrumentos
    doc.setFont('helvetica', 'normal');
    instruments.forEach((inst, index) => {
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = margin;
      }

      // Alternar color de fondo
      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 8, 'F');
      }

      doc.setTextColor(0, 0, 0);
      doc.text(inst.symbol, margin + 3, yPosition);
      doc.text(inst.name.substring(0, 35), margin + 30, yPosition);
      doc.text(inst.category || 'N/A', margin + 100, yPosition);
      doc.text(`${inst.percentage.toFixed(2)}%`, margin + 140, yPosition);
      yPosition += 8;
    });

    yPosition += 10;

    // Total
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    const totalPercentage = instruments.reduce((sum, inst) => sum + inst.percentage, 0);
    doc.text(`Total: ${totalPercentage.toFixed(2)}%`, margin + 140, yPosition);
    yPosition += 15;

    // Resumen Ejecutivo
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setFontSize(18);
    doc.setTextColor(...colors.azulImpulso);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumen Ejecutivo', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setTextColor(...colors.gris);
    doc.setFont('helvetica', 'normal');
    const summaryLines = doc.splitTextToSize(analysis.summary, pageWidth - 2 * margin);
    summaryLines.forEach((line: string) => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(line, margin, yPosition);
      yPosition += 5;
    });

    // ========== PÁGINA 2: ANÁLISIS DETALLADO ==========

    doc.addPage();
    yPosition = margin;

    // Encabezado de página
    doc.setFillColor(...colors.azulRespaldo);
    doc.rect(0, 0, pageWidth, 30, 'F');
    doc.setTextColor(...colors.blanco);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Análisis Detallado de Instrumentos', margin, 20);

    yPosition = 40;

    // Análisis de cada instrumento
    analysis.instrumentDetails.forEach((inst, index) => {
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = margin;
      }

      // Nombre del instrumento
      doc.setFontSize(14);
      doc.setTextColor(...colors.azulImpulso);
      doc.setFont('helvetica', 'bold');
      doc.text(`${inst.symbol} - ${inst.name}`, margin, yPosition);
      yPosition += 8;

      // Descripción
      doc.setFontSize(9);
      doc.setTextColor(...colors.gris);
      doc.setFont('helvetica', 'normal');
      const descLines = doc.splitTextToSize(inst.description, pageWidth - 2 * margin);
      descLines.forEach((line: string) => {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(line, margin, yPosition);
        yPosition += 4;
      });
      yPosition += 3;

      // Sector
      if (inst.sector) {
        doc.setFont('helvetica', 'bold');
        doc.text('Sector: ', margin, yPosition);
        doc.setFont('helvetica', 'normal');
        doc.text(inst.sector, margin + 15, yPosition);
        yPosition += 5;
      }

      // Riesgos
      if (inst.risks) {
        doc.setFont('helvetica', 'bold');
        doc.text('Riesgos: ', margin, yPosition);
        yPosition += 4;
        doc.setFont('helvetica', 'normal');
        const riskLines = doc.splitTextToSize(inst.risks, pageWidth - 2 * margin - 5);
        riskLines.forEach((line: string) => {
          if (yPosition > pageHeight - 20) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(line, margin + 3, yPosition);
          yPosition += 4;
        });
        yPosition += 2;
      }

      // Oportunidades
      if (inst.opportunities) {
        doc.setFont('helvetica', 'bold');
        doc.text('Oportunidades: ', margin, yPosition);
        yPosition += 4;
        doc.setFont('helvetica', 'normal');
        const oppLines = doc.splitTextToSize(inst.opportunities, pageWidth - 2 * margin - 5);
        oppLines.forEach((line: string) => {
          if (yPosition > pageHeight - 20) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(line, margin + 3, yPosition);
          yPosition += 4;
        });
      }

      yPosition += 8;

      // Línea separadora
      if (index < analysis.instrumentDetails.length - 1) {
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 8;
      }
    });

    // ========== PÁGINA 3: NOTICIAS Y RECOMENDACIONES ==========

    if (analysis.news && analysis.news.length > 0) {
      doc.addPage();
      yPosition = margin;

      // Encabezado
      doc.setFillColor(...colors.azulRespaldo);
      doc.rect(0, 0, pageWidth, 30, 'F');
      doc.setTextColor(...colors.blanco);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Contexto de Mercado y Noticias', margin, 20);

      yPosition = 40;

      // Noticias
      analysis.news.forEach((newsItem, index) => {
        if (yPosition > pageHeight - 50) {
          doc.addPage();
          yPosition = margin;
        }

        // Título de la noticia
        doc.setFontSize(12);
        doc.setTextColor(...colors.azulImpulso);
        doc.setFont('helvetica', 'bold');
        const titleLines = doc.splitTextToSize(newsItem.title, pageWidth - 2 * margin);
        titleLines.forEach((line: string) => {
          doc.text(line, margin, yPosition);
          yPosition += 6;
        });

        // Resumen
        doc.setFontSize(9);
        doc.setTextColor(...colors.gris);
        doc.setFont('helvetica', 'normal');
        const newsLines = doc.splitTextToSize(newsItem.summary, pageWidth - 2 * margin);
        newsLines.forEach((line: string) => {
          if (yPosition > pageHeight - 20) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(line, margin, yPosition);
          yPosition += 4;
        });

        // Fecha y símbolos relevantes
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`${newsItem.date} | Relevante para: ${newsItem.relevantSymbols.join(', ')}`, margin, yPosition);
        yPosition += 10;

        // Línea separadora
        if (index < analysis.news.length - 1) {
          doc.setDrawColor(200, 200, 200);
          doc.setLineWidth(0.3);
          doc.line(margin, yPosition, pageWidth - margin, yPosition);
          yPosition += 6;
        }
      });
    }

    // Recomendaciones
    if (analysis.recommendations) {
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = margin;
      } else {
        yPosition += 10;
      }

      doc.setFontSize(16);
      doc.setTextColor(...colors.verdeActivo);
      doc.setFont('helvetica', 'bold');
      doc.text('Recomendaciones', margin, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setTextColor(...colors.gris);
      doc.setFont('helvetica', 'normal');
      const recLines = doc.splitTextToSize(analysis.recommendations, pageWidth - 2 * margin);
      recLines.forEach((line: string) => {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(line, margin, yPosition);
        yPosition += 5;
      });
    }

    // ========== PIE DE PÁGINA EN TODAS LAS PÁGINAS ==========

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);

      // Línea superior del footer
      doc.setDrawColor(...colors.verdeActivo);
      doc.setLineWidth(1);
      doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

      // Texto del footer
      doc.setFontSize(8);
      doc.setTextColor(...colors.gris);
      doc.setFont('helvetica', 'normal');
      doc.text('VetaCap | El foco está en vos', margin, pageHeight - 10);
      doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin - 20, pageHeight - 10);
      doc.text('Este documento es confidencial', pageWidth / 2 - 30, pageHeight - 10);
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
