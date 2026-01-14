import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Converts a given HTML element (the receipt content) into a PDF
 * and triggers the browser's print dialog.
 * @param element The DOM element containing the receipt content.
 * @param receiptWidthPx The width of the receipt in pixels (from settings).
 */
export const printReceiptAsPdf = async (element: HTMLElement, receiptWidthPx: number) => {
  if (!element) {
    console.error("Print element not found.");
    return;
  }

  // 1. Capture the HTML content as an image (canvas)
  const canvas = await html2canvas(element, {
    scale: 2, // Increase scale for better resolution
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff', // Ensure white background
  });

  const imgData = canvas.toDataURL('image/jpeg', 1.0);
  const imgWidth = receiptWidthPx; // Use the configured width
  const pageHeight = (canvas.height * imgWidth) / canvas.width;

  // 2. Initialize jsPDF
  // We use 'mm' units for precision. 80mm is the target width.
  const pdfWidthMm = 80;
  
  // Calculate the height in mm based on the aspect ratio of the captured image
  // 1 pixel is approximately 0.264583 mm (at 96 DPI, but we rely on the ratio)
  const ratio = pdfWidthMm / imgWidth;
  const pdfHeightMm = pageHeight * ratio;

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [pdfWidthMm, pdfHeightMm], 
  });

  // Add the image to the PDF
  pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidthMm, pdfHeightMm);

  // 3. Trigger printing
  // Open PDF in a new window and trigger print
  const pdfBlob = pdf.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  
  const printWindow = window.open(pdfUrl, '_blank');
  
  if (printWindow) {
    printWindow.onload = () => {
      // Clean up the URL object after printing/closing
      printWindow.onbeforeunload = () => {
        URL.revokeObjectURL(pdfUrl);
      };
      // Attempt to trigger print dialog
      printWindow.print();
    };
  } else {
    // Fallback if popups are blocked
    console.error("Popup blocked. Cannot open PDF for printing.");
    // Optionally, download the PDF instead
    // pdf.save('order_receipt.pdf');
  }
};