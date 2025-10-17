import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import fs from 'fs';
import path from 'path';

/**
 * Genera un PDF individual con la descripción de un instrumento
 * GET /api/portfolio/instrument-pdf?symbol=AAPL&name=Apple Inc.&category=CEDEARs
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get('symbol') || '';
    const name = searchParams.get('name') || '';
    const category = searchParams.get('category') || '';

    if (!symbol || !name) {
      return NextResponse.json(
        { success: false, error: 'Faltan parámetros: symbol y name son requeridos' },
        { status: 400 }
      );
    }

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

    // Fondo de encabezado
    doc.setFillColor(...colors.azulRespaldo);
    doc.rect(0, 0, pageWidth, 55, 'F');
    doc.setFillColor(...colors.verdeActivo);
    doc.rect(0, 53, pageWidth, 2, 'F');

    // Logo VetaCap
    try {
      const logoPath = path.join(process.cwd(), 'public', 'logos', 'vetacap-logo-oficial.png');
      const logoBase64 = fs.readFileSync(logoPath).toString('base64');
      const logoHeight = 12;
      const logoWidth = logoHeight * 4.67;
      doc.addImage(`data:image/png;base64,${logoBase64}`, 'PNG', margin, 20, logoWidth, logoHeight);
    } catch (error) {
      doc.setTextColor(...colors.blanco);
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.text('VETACAP', margin, 28);
    }

    yPosition = 70;

    // Título: Símbolo y Nombre
    doc.setFillColor(...colors.azulImpulso);
    doc.roundedRect(margin, yPosition, contentWidth, 18, 2, 2, 'F');
    doc.setTextColor(...colors.blanco);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(`${symbol}`, margin + 5, yPosition + 8);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(`- ${name}`, margin + 5 + doc.getTextWidth(`${symbol}`) + 3, yPosition + 8);
    yPosition += 24;

    // Badge de categoría
    if (category) {
      doc.setFillColor(...colors.grisClaro);
      doc.roundedRect(margin, yPosition, 60, 8, 1, 1, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...colors.azulRespaldo);
      doc.text(`CATEGORÍA: ${category.toUpperCase()}`, margin + 3, yPosition + 5.5);
      yPosition += 14;
    }

    // Descripción del instrumento
    const description = getInstrumentDescription({ symbol, name, category });

    doc.setFillColor(...colors.grisClaro);
    const descLines = doc.splitTextToSize(description, contentWidth - 12);
    const descHeight = descLines.length * 5.5 + 12;
    doc.roundedRect(margin, yPosition, contentWidth, descHeight, 2, 2, 'F');

    yPosition += 8;
    doc.setFontSize(10);
    doc.setTextColor(...colors.negro);
    doc.setFont('helvetica', 'normal');

    descLines.forEach((line: string) => {
      doc.text(line, margin + 6, yPosition);
      yPosition += 5.5;
    });

    // Footer
    doc.setDrawColor(...colors.verdeActivo);
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - 18, pageWidth - margin, pageHeight - 18);

    doc.setFillColor(250, 250, 250);
    doc.rect(0, pageHeight - 17, pageWidth, 17, 'F');

    doc.setFontSize(7);
    doc.setTextColor(...colors.azulRespaldo);
    doc.setFont('helvetica', 'bold');
    doc.text('VetaCap', margin, pageHeight - 10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colors.gris);
    doc.text('| El foco está en vos', margin + 14, pageHeight - 10);

    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.setFont('helvetica', 'italic');
    doc.text('Este documento es confidencial', pageWidth / 2, pageHeight - 10, { align: 'center' });

    // Generar el PDF como Buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    // Retornar como respuesta
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="VetaCap_${symbol}_${new Date().toISOString().split('T')[0]}.pdf"`,
      },
    });

  } catch (error) {
    console.error('Error generating instrument PDF:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        message: 'Error al generar PDF del instrumento',
      },
      { status: 500 }
    );
  }
}

/**
 * Obtiene la descripción de un instrumento según su categoría
 */
function getInstrumentDescription(inst: { symbol: string; name: string; category?: string }): string {
  const category = inst.category || 'Instrumento financiero';

  const descriptions: Record<string, string> = {
    'Acciones': `${inst.name} (${inst.symbol}) es una acción que representa una participación en el capital social de la empresa, otorgando derechos de propiedad proporcionales al inversor.`,

    'Bonos Soberanos': `${inst.name} (${inst.symbol}) es un título de deuda emitido por el Estado Nacional Argentino, mediante el cual el inversor presta dinero al gobierno a cambio de pagos periódicos de intereses y la devolución del capital al vencimiento.`,

    'Bonos Corporativos': `${inst.name} (${inst.symbol}) es un título de deuda emitido por una empresa privada para financiar sus operaciones, mediante el cual el inversor recibe cupones de intereses periódicos y la devolución del principal al vencimiento.`,

    'CEDEARs': `${inst.name} (${inst.symbol}) es un Certificado de Depósito Argentino que representa acciones de una compañía extranjera, permitiendo a inversores locales acceder a activos internacionales operando desde el mercado argentino.`,

    'ETFs': `${inst.name} (${inst.symbol}) es un Exchange Traded Fund (fondo cotizado en bolsa) que ofrece exposición diversificada a un conjunto de activos mediante un único instrumento que cotiza como una acción.`,

    'ETFs Cripto': `${inst.name} (${inst.symbol}) es un Exchange Traded Fund especializado que proporciona exposición al mercado de criptomonedas y activos digitales a través de un vehículo de inversión regulado.`,

    'Criptomonedas': `${inst.name} (${inst.symbol}) es un activo digital descentralizado que opera sobre tecnología blockchain, funcionando como medio de intercambio, reserva de valor, o plataforma para aplicaciones descentralizadas.`,
  };

  return descriptions[category] || `${inst.name} (${inst.symbol}) es un instrumento financiero de la categoría ${category} que ofrece oportunidades de inversión específicas según el perfil y objetivos del inversor.`;
}
