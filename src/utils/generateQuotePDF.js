import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Formatter for currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Helper: Fetch image and convert to base64 JPEG via Canvas (handles WebP/transparent PNGs better for jsPDF)
const getBase64ImageFromUrl = async (imageUrl) => {
  if (!imageUrl) return null;
  try {
    const img = new Image();
    img.crossOrigin = 'Anonymous'; // Needed for CORS
    
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imageUrl;
    });

    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    
    const ctx = canvas.getContext('2d');
    // Fill white background in case of transparent images
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Draw image over it
    ctx.drawImage(img, 0, 0);
    
    return canvas.toDataURL('image/jpeg', 0.8);
  } catch (error) {
    console.warn(`Could not load image ${imageUrl}`, error);
    return null;
  }
};

/**
 * Generates and downloads a Quote PDF.
 * @param {Object} cotizacion - The DB row from the 'cotizaciones' table (has version, total, itemsSnapshot).
 * @param {Object} event - The enriched event object.
 * @param {Object} settings - PDF Settings (from useSiteSettings or appSettings).
 * @param {string} action - Action to perform: 'download' (default) or 'view'.
 */
export const generateQuotePDF = async (cotizacion, event, settings, action = 'download') => {
  const doc = new jsPDF();
  
  // Settings with fallbacks
  const themeColor = settings?.pdfThemeColor || '#4F46E5'; 
  const logoUrl = settings?.pdfLogoUrl || '';
  const companyName = settings?.pdfCompanyName || 'Rentevent S.A.S.';
  const email = settings?.pdfEmail || 'info@rentevent.co';
  const phone = settings?.pdfPhone || '+573000000000';
  const address = settings?.pdfAddress || 'Bogotá, Colombia';
  const footerText = settings?.pdfFooterText || 'Gracias por preferirnos. Esta cotización tiene una validez de 15 días.';
  const disclaimerText = settings?.pdfDisclaimer || '';

  const marginX = 14;
  let currentY = 20;

  // 1. HEADER (Logo & Company Info)
  if (logoUrl) {
    try {
      const base64Logo = await getBase64ImageFromUrl(logoUrl);
      if (base64Logo) {
        // Very basic placement, ideally width/height ratio should be determined.
        doc.addImage(base64Logo, 'PNG', marginX, currentY - 5, 40, 15);
      }
    } catch (error) {
      console.warn('Could not load quote PDF logo', error);
    }
  }

  doc.setFontSize(22);
  doc.setTextColor(themeColor);
  doc.text('COTIZACIÓN', 200 - marginX, currentY, { align: 'right' });
  
  currentY += 10;
  
  doc.setFontSize(10);
  doc.setTextColor('#333333');
  doc.text(companyName, marginX, currentY);
  doc.text(`Cotización N°: ${String(event.id).substring(0,8).toUpperCase()}-V${cotizacion.version}`, 200 - marginX, currentY, { align: 'right' });
  
  currentY += 5;
  doc.text(email, marginX, currentY);
  doc.text(`Fecha: ${new Date(cotizacion.createdAt || Date.now()).toLocaleDateString()}`, 200 - marginX, currentY, { align: 'right' });
  
  currentY += 5;
  doc.text(phone, marginX, currentY);
  
  currentY += 5;
  doc.text(address, marginX, currentY);

  currentY += 15;
  doc.setDrawColor('#E2E8F0');
  doc.line(marginX, currentY, 200 - marginX, currentY);
  currentY += 10;

  // 2. CLIENT & EVENT DETAILS
  doc.setFontSize(12);
  doc.setTextColor(themeColor);
  doc.text('Datos del Cliente', marginX, currentY);
  doc.text('Datos del Evento', 105, currentY);

  currentY += 7;
  doc.setFontSize(10);
  doc.setTextColor('#475569');
  
  doc.text(`Cliente:`, marginX, currentY);
  doc.setFont('helvetica', 'bold');
  doc.text(event.cliente || 'No especificado', marginX + 20, currentY);
  doc.setFont('helvetica', 'normal');

  doc.text(`Evento:`, 105, currentY);
  doc.setFont('helvetica', 'bold');
  doc.text(event.nombreEvento || 'No especificado', 125, currentY);
  doc.setFont('helvetica', 'normal');

  currentY += 5;
  doc.text(`Doc/NIT:`, marginX, currentY);
  doc.text(event.clienteDocumento || 'N/A', marginX + 20, currentY);
  
  doc.text(`Lugar:`, 105, currentY);
  doc.text(event.lugar || 'N/A', 125, currentY);

  currentY += 5;
  doc.text(`Tel:`, marginX, currentY);
  doc.text(event.clienteTelefono || 'N/A', marginX + 20, currentY);

  doc.text(`Cita / Entrega:`, 105, currentY);
  doc.text(`${event.fecha || 'N/A'} ${event.horaEntrega ? `a las ${event.horaEntrega}` : ''}`, 130, currentY);

  currentY += 5;
  doc.text(`Email:`, marginX, currentY);
  doc.text(event.clienteEmail || 'N/A', marginX + 20, currentY);

  doc.text(`Recogida:`, 105, currentY);
  doc.text(`${event.fechaRecogida || event.fecha || 'N/A'} ${event.horaRecogida ? `a las ${event.horaRecogida}` : ''}`, 125, currentY);

  // If there's an organizer differences
  if (event.organizador && event.organizador !== event.cliente && !event.organizadorIgualCliente) {
    currentY += 8;
    doc.setTextColor(themeColor);
    doc.text('Datos del Organizador', marginX, currentY);
    doc.setTextColor('#475569');
    currentY += 5;
    
    doc.text(`Nombre:`, marginX, currentY);
    doc.setFont('helvetica', 'bold');
    doc.text(event.organizador, marginX + 20, currentY);
    doc.setFont('helvetica', 'normal');
    
    currentY += 5;
    doc.text(`Doc/NIT:`, marginX, currentY);
    doc.text(event.organizadorDocumento || 'N/A', marginX + 20, currentY);

    currentY += 5;
    doc.text(`Tel:`, marginX, currentY);
    doc.text(event.organizadorTelefono || 'N/A', marginX + 20, currentY);

    currentY += 5;
    doc.text(`Email:`, marginX, currentY);
    doc.text(event.organizadorEmail || 'N/A', marginX + 20, currentY);
  }

  currentY += 15;

  // 3. TABLE OF ITEMS
  const items = Array.isArray(cotizacion.itemsSnapshot) ? cotizacion.itemsSnapshot : [];
  
  // Pre-fetch images array for autotable
  const rowH = 15;
  const imagePromises = items.map(i => getBase64ImageFromUrl(i.imagenUrl));
  const base64Images = await Promise.all(imagePromises);

  const tableData = items.map((item) => {
    return [
      '', // Placeholder for image
      item.nombre || 'Ítem',
      item.cantidad,
      formatCurrency(item.precioUnitario),
      formatCurrency(item.cantidad * item.precioUnitario)
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [['Imagen', 'Descripción', 'Cantidad', 'V. Unitario', 'Subtotal']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: themeColor, textColor: '#FFFFFF', halign: 'center' },
    columnStyles: {
      0: { cellWidth: 20, halign: 'center', valign: 'middle' },
      1: { cellWidth: 'auto', valign: 'middle' },
      2: { cellWidth: 20, halign: 'center', valign: 'middle' },
      3: { cellWidth: 35, halign: 'right', valign: 'middle' },
      4: { cellWidth: 35, halign: 'right', valign: 'middle' },
    },
    bodyStyles: { minCellHeight: rowH },
    didDrawCell: (data) => {
      // Inject image in the first column
      if (data.section === 'body' && data.column.index === 0) {
        const rowIdx = data.row.index;
        const b64 = base64Images[rowIdx];
        if (b64) {
          const dim = rowH - 4; // padding
          doc.addImage(b64, 'JPEG', data.cell.x + 2, data.cell.y + 2, dim, dim);
        }
      }
    }
  });

  currentY = doc.lastAutoTable.finalY + 10;

  // 4. TOTALS
  const tableTotal = items.reduce((acc, i) => acc + (i.precioUnitario * i.cantidad), 0);
  const transp = Number(event.costoTransporte) || 0;
  const dep = Number(event.depositoSeguridad) || 0;

  doc.setFontSize(10);
  doc.setTextColor('#475569');
  
  doc.text('Subtotal:', 140, currentY);
  doc.text(formatCurrency(tableTotal), 190, currentY, { align: 'right' });
  currentY += 6;
  
  doc.text('Logística / Transp:', 140, currentY);
  doc.text(formatCurrency(transp), 190, currentY, { align: 'right' });
  currentY += 6;
  
  doc.text('Depósito:', 140, currentY);
  doc.text(formatCurrency(dep), 190, currentY, { align: 'right' });
  
  currentY += 8;
  doc.setFontSize(14);
  doc.setTextColor(themeColor);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL:', 140, currentY);
  doc.text(formatCurrency(tableTotal + transp + dep), 190, currentY, { align: 'right' });

  // DISCLAIMER
  if (disclaimerText) {
    currentY += 15;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor('#64748B');
    
    // Auto wrap text to fit within the width
    const splitDisclaimer = doc.splitTextToSize(disclaimerText, 200 - (marginX * 2));
    
    // Check if disclaimer fits on the current page, if not, add a new page
    if (currentY + (splitDisclaimer.length * 4) > 280) {
      doc.addPage();
      currentY = 20;
    }

    doc.text(splitDisclaimer, marginX, currentY);
  }

  // 5. FOOTER
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor('#94A3B8');
    const footerY = doc.internal.pageSize.height - 15;
    doc.line(marginX, footerY - 5, 200 - marginX, footerY - 5);
    doc.text(footerText, marginX, footerY, { maxWidth: 170 });
    doc.text(`Página ${i} de ${pageCount}`, 200 - marginX, footerY, { align: 'right' });
  }

  // OUTPUT ACTION
  const filename = `Cotizacion-${event.nombreEvento || event.cliente}-${new Date().toISOString().slice(0,10)}.pdf`;
  
  if (action === 'view') {
    window.open(doc.output('bloburl'), '_blank');
  } else {
    doc.save(filename.replace(/[^a-z0-9-.]/gi, '_'));
  }
};
