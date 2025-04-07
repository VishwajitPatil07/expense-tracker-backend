import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction } from '@shared/schema';
import { format } from 'date-fns';

interface ExportOptions {
  title?: string;
  fileName?: string;
  includeDate?: boolean;
}

export function exportTransactionsToPdf(
  transactions: Transaction[],
  options: ExportOptions = {}
) {
  // Set default options
  const {
    title = 'Transaction Report',
    fileName = 'transactions',
    includeDate = true,
  } = options;

  // Create a new PDF document
  const doc = new jsPDF();
  
  // Add title to the document
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  
  // Add date if requested
  if (includeDate) {
    doc.setFontSize(11);
    doc.text(`Generated on: ${format(new Date(), 'PPP')}`, 14, 30);
  }
  
  // Format data for the table
  const tableData = transactions.map(transaction => {
    let formattedDate = 'N/A';
    try {
      formattedDate = format(new Date(transaction.date), 'PPP');
    } catch (error) {
      console.error('Error formatting date for PDF:', error);
    }
    
    return [
      transaction.description,
      transaction.type === 'income' ? '+' + transaction.amount : '-' + transaction.amount,
      transaction.category,
      formattedDate,
      transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1) // Capitalize first letter
    ];
  });
  
  // Define columns for the table
  const tableColumns = [
    { header: 'Description', dataKey: 'description' },
    { header: 'Amount', dataKey: 'amount' },
    { header: 'Category', dataKey: 'category' },
    { header: 'Date', dataKey: 'date' },
    { header: 'Type', dataKey: 'type' }
  ];
  
  // Create the table
  autoTable(doc, {
    head: [['Description', 'Amount', 'Category', 'Date', 'Type']],
    body: tableData,
    startY: 40,
    theme: 'striped',
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    alternateRowStyles: { fillColor: [240, 240, 240] }
  });
  
  // Save the PDF
  doc.save(`${fileName}.pdf`);
}