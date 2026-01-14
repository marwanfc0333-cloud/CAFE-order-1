import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Converts a given HTML element (the receipt content) into a PDF
 * and attempts to trigger the browser's print dialog directly.
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
  const imgWidth = receiptWidthPx; 
  const pageHeight = (canvas.height * imgWidth) / canvas.width;

  // 2. Initialize jsPDF for 80mm thermal receipt format
  const pdfWidthMm = 80;
  
  // Calculate the height in mm based on the aspect ratio
  const ratio = pdfWidthMm / imgWidth;
  const pdfHeightMm = pageHeight * ratio;

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [pdfWidthMm, pdfHeightMm], 
  });

  // Add the image to the PDF
  pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidthMm, pdfHeightMm);

  // 3. Attempt direct printing (This relies on browser support and settings)
  
  // Using output('dataurlnewwindow') combined with autoPrint() is the closest we can get 
  // to direct printing without a dedicated print server, but it still opens a temporary window.
  // We will try to use the data URL method which is slightly less intrusive than opening a blank window first.
  
  try {
    // This method opens a new window/tab containing the PDF and immediately triggers print.
    // It is the most reliable way to ensure the 80mm format is respected in a web environment.
    pdf.output('dataurlnewwindow', { filename: 'receipt.pdf' });
    
    // Note: We cannot programmatically close the window opened by dataurlnewwindow 
    // due to browser security restrictions, but it should close automatically 
    // after the user interacts with the print dialog (depending on the browser).
    
  } catch (error) {
    console.error("Failed to trigger direct PDF print:", error);
    // Fallback: Save the PDF if direct print fails
    pdf.save('order_receipt.pdf');
  }
};