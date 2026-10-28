import type { OrderStatus } from '../database.types';
import { formatINR } from '../money';

export interface OrderCsvRecord {
  orderId: string;
  enquiryRef: string;
  createdAt: string;
  customerName: string | null;
  customerPhone: string | null;
  shippingAddress: string | null;
  itemsSummary: string;
  totalPaise: number;
  status: OrderStatus;
  courier: string | null;
  trackingNumber: string | null;
}

/**
 * Escapes a single CSV cell value according to RFC 4180 rules
 * and neutralizes spreadsheet formula injection vulnerabilities.
 */
export function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) {
    return '""';
  }

  let str = String(value);

  // 1. Defend against Spreadsheet Formula Injection (CSV Injection)
  // If the cell begins with =, +, -, @, tab (\t), or carriage return (\r), prepend a single quote
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // 2. Escape double quotes by doubling them (" -> "")
  const escapedQuotes = str.replace(/"/g, '""');

  // 3. Wrap in quotes
  return `"${escapedQuotes}"`;
}

/**
 * Builds an RFC 4180 compliant CSV string with a UTF-8 BOM prefix
 * for seamless compatibility with Microsoft Excel and Google Sheets.
 */
export function buildOrdersCsv(records: OrderCsvRecord[]): string {
  const headers = [
    'Order ID',
    'Enquiry Ref',
    'Date',
    'Customer Name',
    'Phone',
    'Address',
    'Items',
    'Total',
    'Status',
    'Courier',
    'Tracking Number',
  ];

  const rows: string[] = [];

  // Header row
  rows.push(headers.map((h) => `"${h}"`).join(','));

  // Data rows
  for (const rec of records) {
    const formattedDate = new Date(rec.createdAt).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const formattedTotal = formatINR(rec.totalPaise);

    const row = [
      escapeCsvCell(rec.orderId),
      escapeCsvCell(rec.enquiryRef),
      escapeCsvCell(formattedDate),
      escapeCsvCell(rec.customerName || ''),
      escapeCsvCell(rec.customerPhone || ''),
      escapeCsvCell(rec.shippingAddress || ''),
      escapeCsvCell(rec.itemsSummary),
      escapeCsvCell(formattedTotal),
      escapeCsvCell(rec.status),
      escapeCsvCell(rec.courier || ''),
      escapeCsvCell(rec.trackingNumber || ''),
    ];

    rows.push(row.join(','));
  }

  // Prepend UTF-8 Byte Order Mark (\uFEFF)
  return `\uFEFF${rows.join('\r\n')}`;
}

/**
 * Triggers a browser download of the generated CSV file.
 */
export function triggerCsvDownload(csvContent: string, fileName: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
