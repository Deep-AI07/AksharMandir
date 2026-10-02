import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Order } from '../types';

export const formatCurrency = (amount: number): string => {
  return `₹${Math.round(amount || 0).toLocaleString('en-IN')}`;
};

export const generateInvoiceHtml = (order: Order, brandConfig?: any): string => {
  const brandName = brandConfig?.brandName || 'AKSHAR MANDIR';
  const tagline = brandConfig?.tagline || 'Divine Modernity • Handcrafted Home Mandirs';
  const supportEmail = brandConfig?.supportEmail || 'blessings@aksharmandir.com';
  const supportPhone = brandConfig?.supportPhone || '+91 98765 43210';
  const primaryColor = brandConfig?.primaryColor || '#570000';

  const orderDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const address =
    order.addressSnapshot ||
    (typeof order.addressSnapshot === 'string' ? JSON.parse(order.addressSnapshot) : order.shippingAddress);

  const subtotal = order.subtotal || order.items?.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0) || order.total;
  const discount = order.discount || 0;
  const total = order.total;

  const itemsHtml = (order.items || [])
    .map(
      (item: any, idx: number) => `
      <tr style="border-bottom: 1px solid #eae5e2;">
        <td style="padding: 10px 8px; font-weight: 600; color: #1f1c1b; font-size: 11px;">
          ${idx + 1}. ${item.title || 'Home Mandir'}
          <div style="font-size: 9.5px; color: #78716c; font-weight: normal; margin-top: 2px;">
            Finish: ${item.finish || 'Natural Teak'} ${item.sku ? `• SKU: ${item.sku}` : ''}
          </div>
        </td>
        <td style="padding: 10px 8px; text-align: center; color: #44403c; font-size: 11px;">${item.quantity}</td>
        <td style="padding: 10px 8px; text-align: right; color: #44403c; font-size: 11px;">${formatCurrency(item.price)}</td>
        <td style="padding: 10px 8px; text-align: right; font-weight: 700; color: #1f1c1b; font-size: 11px;">${formatCurrency(item.price * item.quantity)}</td>
      </tr>
    `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Invoice #${order.orderNumber} - ${brandName}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 10mm 12mm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #1f1c1b;
            background: #fff;
            margin: 0;
            padding: 0;
            font-size: 11px;
            line-height: 1.4;
          }
          .invoice-box {
            width: 100%;
            max-width: 760px;
            margin: 0 auto;
            border: 1px solid #e7e0dc;
            border-radius: 12px;
            padding: 24px 28px;
            background: #ffffff;
            box-sizing: border-box;
          }
          .header-wrapper {
            width: 100%;
            border-bottom: 2.5px solid ${primaryColor};
            padding-bottom: 16px;
            margin-bottom: 22px;
            box-sizing: border-box;
          }
          .header-table {
            width: 100%;
            border-collapse: collapse;
          }
          .header-table td {
            vertical-align: top;
            padding: 0 0 6px 0;
          }
          .brand-title {
            font-family: Georgia, serif;
            font-size: 22px;
            font-weight: bold;
            color: ${primaryColor};
            letter-spacing: 0.5px;
            margin: 0;
            line-height: 1.2;
          }
          .brand-tagline {
            font-size: 10px;
            color: #78716c;
            margin-top: 4px;
            font-weight: 500;
          }
          .workshop-info {
            font-size: 9.5px;
            color: #57534e;
            margin-top: 6px;
            line-height: 1.5;
          }
          .invoice-heading {
            font-size: 17px;
            font-weight: bold;
            color: ${primaryColor};
            font-family: Georgia, serif;
            letter-spacing: 0.5px;
            line-height: 1.2;
            text-transform: uppercase;
          }
          .invoice-subnum {
            font-size: 11px;
            font-family: monospace;
            font-weight: bold;
            color: #1f1c1b;
            margin-top: 3px;
          }
          .invoice-date {
            font-size: 10px;
            color: #57534e;
            margin-top: 3px;
          }
          .badge-box {
            margin-top: 6px;
          }
          .meta-box {
            background: #faf7f5;
            border: 1px solid #eedcd0;
            border-radius: 8px;
            padding: 12px 14px;
            margin-bottom: 18px;
          }
          .meta-table {
            width: 100%;
            border-collapse: collapse;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 16px;
          }
          .items-table th {
            background: #f5efe9;
            color: ${primaryColor};
            font-weight: 700;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 8px;
            border-bottom: 1.5px solid #d6c7bc;
          }
          .summary-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
          }
          .badge {
            display: inline-block;
            padding: 3px 9px;
            border-radius: 4px;
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            line-height: 1.2;
          }
          .badge-paid {
            background: #e8f5e9;
            color: #1b5e20;
            border: 1px solid #81c784;
          }
          .badge-pending {
            background: #fff8e1;
            color: #b45309;
            border: 1px solid #fde68a;
          }
          .footer-note {
            margin-top: 20px;
            padding-top: 12px;
            border-top: 1px dashed #d6c7bc;
            font-size: 9px;
            color: #78716c;
            text-align: center;
          }
          .stamp-box {
            border: 1.5px dashed ${primaryColor};
            color: ${primaryColor};
            font-size: 8.5px;
            font-weight: bold;
            text-transform: uppercase;
            padding: 6px 12px;
            border-radius: 6px;
            display: inline-block;
            text-align: center;
            letter-spacing: 0.5px;
          }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <!-- Top Header -->
          <div class="header-wrapper">
            <table class="header-table">
              <tr>
                <td style="vertical-align: top; width: 58%; text-align: left;">
                  <div class="brand-title">${brandName}</div>
                  <div class="brand-tagline">${tagline}</div>
                  <div class="workshop-info">
                    Vedic Dimensions &amp; Seasoned Hardwood Mandir Workshop<br/>
                    ${supportPhone} &bull; ${supportEmail}
                  </div>
                </td>
                <td style="vertical-align: top; text-align: right; width: 42%;">
                  <div class="invoice-heading">TAX INVOICE</div>
                  <div class="invoice-subnum">#${order.orderNumber}</div>
                  <div class="invoice-date">Date: <strong>${orderDate}</strong></div>
                  <div class="badge-box">
                    <span class="badge ${order.paymentStatus === 'SUCCESS' ? 'badge-paid' : 'badge-pending'}">
                      Payment: ${order.paymentStatus || 'PENDING'} (${order.paymentMethod || 'COD'})
                    </span>
                  </div>
                </td>
              </tr>
            </table>
          </div>

          <!-- Bill To / Ship To Grid -->
          <div class="meta-box">
            <table class="meta-table">
              <tr>
                <td style="vertical-align: top; width: 50%; padding-right: 12px;">
                  <div style="font-size: 9px; font-weight: bold; text-transform: uppercase; color: #78716c; letter-spacing: 0.5px; margin-bottom: 4px;">
                    Billed & Delivered To:
                  </div>
                  <div style="font-size: 11px; font-weight: bold; color: #1f1c1b;">
                    ${order.customerName || address?.fullName || 'Valued Customer'}
                  </div>
                  <div style="font-size: 10px; color: #44403c; margin-top: 2px;">
                    ${order.customerPhone || address?.phone || ''} ${order.customerEmail ? `• ${order.customerEmail}` : ''}
                  </div>
                  <div style="font-size: 10px; color: #57534e; margin-top: 3px; line-height: 1.35;">
                    ${address ? `${address.addressLine1 || ''}${address.addressLine2 ? `, ${address.addressLine2}` : ''}<br/>${address.city || ''}, ${address.state || ''} - ${address.postalCode || ''}` : 'Standard Shipping Address'}
                  </div>
                </td>
                <td style="vertical-align: top; width: 50%; padding-left: 12px; border-left: 1px solid #e7e0dc;">
                  <div style="font-size: 9px; font-weight: bold; text-transform: uppercase; color: #78716c; letter-spacing: 0.5px; margin-bottom: 4px;">
                    Delivery & Dispatch Details:
                  </div>
                  <div style="font-size: 10px; color: #44403c;">
                    <strong>Fulfillment:</strong> Pan-India White-Glove Mandir Delivery
                  </div>
                  <div style="font-size: 10px; color: #44403c; margin-top: 2px;">
                    <strong>Delivery Status:</strong> ${order.deliveryStatus || 'CONFIRMED'}
                  </div>
                  ${order.trackingNumber ? `
                    <div style="font-size: 10px; color: #44403c; margin-top: 2px;">
                      <strong>Tracking AWB:</strong> <span style="font-family: monospace; font-weight: bold;">${order.trackingNumber}</span>
                    </div>
                  ` : ''}
                  <div style="font-size: 9.5px; color: #78716c; margin-top: 4px;">
                    Includes 5-Year Structural Integrity Warranty & Authenticity Certificate.
                  </div>
                </td>
              </tr>
            </table>
          </div>

          <!-- Items Table -->
          <table class="items-table">
            <thead>
              <tr>
                <th style="text-align: left; width: 55%;">Mandir Item Description</th>
                <th style="text-align: center; width: 12%;">Qty</th>
                <th style="text-align: right; width: 16%;">Rate (₹)</th>
                <th style="text-align: right; width: 17%;">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <!-- Totals and Verification Stamp -->
          <table class="summary-table">
            <tr>
              <td style="vertical-align: top; width: 55%; padding-right: 15px;">
                <div class="stamp-box">
                  ✦ Authentic Handcrafted Mandir Guaranteed ✦<br/>
                  Akshar Mandir Seal of Craftsmanship
                </div>
                <div style="font-size: 9px; color: #78716c; margin-top: 8px;">
                  All prices are inclusive of GST, crate packaging, transit insurance, and doorstep mandir placement.
                </div>
              </td>
              <td style="vertical-align: top; width: 45%;">
                <table style="width: 100%; border-collapse: collapse; font-size: 10.5px;">
                  <tr>
                    <td style="padding: 4px 0; color: #57534e;">Items Subtotal:</td>
                    <td style="padding: 4px 0; text-align: right; font-weight: 600;">${formatCurrency(subtotal)}</td>
                  </tr>
                  ${discount > 0 ? `
                    <tr>
                      <td style="padding: 4px 0; color: #16a34a;">Promo Discount (${order.couponCode || 'APPLIED'}):</td>
                      <td style="padding: 4px 0; text-align: right; color: #16a34a; font-weight: 600;">-${formatCurrency(discount)}</td>
                    </tr>
                  ` : ''}
                  <tr>
                    <td style="padding: 4px 0; color: #57534e;">White-Glove Delivery:</td>
                    <td style="padding: 4px 0; text-align: right; font-weight: 600; color: #16a34a;">FREE</td>
                  </tr>
                  <tr style="border-top: 2px solid ${primaryColor}; font-size: 13px;">
                    <td style="padding: 8px 0; font-weight: bold; color: ${primaryColor}; font-family: Georgia, serif;">Grand Total:</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: bold; color: ${primaryColor}; font-family: Georgia, serif;">${formatCurrency(total)}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- Footer -->
          <div class="footer-note">
            Thank you for choosing ${brandName}. May this mandir bring peace, prosperity, and Bhakti at Home to your family.<br/>
            For care instructions, custom sizing, or assistance: ${supportEmail} • +91 98765 43210
          </div>
        </div>
      </body>
    </html>
  `;
};

/**
 * Clean Single-Page Print Handler
 * Resolves the issue where printing previously spawned 3+ pages.
 * Creates an isolated hidden iframe containing exclusively the single invoice page.
 */
export const printInvoice = (order: Order, brandConfig?: any): void => {
  const invoiceHtml = generateInvoiceHtml(order, brandConfig);

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document || iframe.contentDocument;
  if (!doc) {
    window.print();
    return;
  }

  doc.open();
  doc.write(invoiceHtml);
  doc.close();

  // Trigger print after iframe renders
  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    // Clean up iframe after print dialog closes
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 2000);
  }, 350);
};

/**
 * Client-side Single Page PDF Download
 * Captures the standardized invoice document directly into an A4 PDF without clipping or layout distortion.
 */
export const downloadInvoicePdf = async (
  order: Order,
  brandConfig?: any,
  containerElement?: HTMLElement | null
): Promise<void> => {
  try {
    const invoiceHtml = generateInvoiceHtml(order, brandConfig);

    // Create an isolated offscreen iframe to ensure accurate layout, styles, fonts, and box boundaries
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.left = '0';
    iframe.style.top = '0';
    iframe.style.width = '794px'; // Standard A4 width at 96 DPI
    iframe.style.height = '1123px'; // Standard A4 height at 96 DPI
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';
    iframe.style.zIndex = '-99999';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) {
      throw new Error('Could not access iframe document for PDF generation');
    }

    doc.open();
    doc.write(invoiceHtml);
    doc.close();

    // Allow browser layout and web fonts to settle
    await new Promise(resolve => setTimeout(resolve, 350));

    const targetElement = (doc.querySelector('.invoice-box') as HTMLElement) || doc.body;

    const canvas = await html2canvas(targetElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 794,
      scrollX: 0,
      scrollY: 0,
    });

    document.body.removeChild(iframe);

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Maintain 12mm margins
    const margin = 12;
    const imgWidth = pageWidth - margin * 2;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Check if invoice fits in a single page (standard case)
    if (imgHeight <= pageHeight - 24) {
      const y = Math.max(10, Math.min(18, (pageHeight - imgHeight) / 3));
      pdf.addImage(imgData, 'JPEG', margin, y, imgWidth, imgHeight);
    } else {
      // Scale proportionally if content is taller
      const scale = (pageHeight - 24) / imgHeight;
      const fitWidth = imgWidth * scale;
      const fitX = (pageWidth - fitWidth) / 2;
      pdf.addImage(imgData, 'JPEG', fitX, 12, fitWidth, pageHeight - 24);
    }

    pdf.save(`Akshar_Mandir_Invoice_${order.orderNumber || 'AKM'}.pdf`);
  } catch (error) {
    console.error('Error generating PDF with jsPDF, falling back to print dialog:', error);
    printInvoice(order, brandConfig);
  }
};
