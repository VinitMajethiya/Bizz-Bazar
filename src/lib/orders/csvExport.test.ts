import { describe, it, expect } from 'vitest';
import { escapeCsvCell, buildOrdersCsv, type OrderCsvRecord } from './csvExport';

describe('CSV Export & Formula Injection Sanitization', () => {
  it('escapes standard cells and quotes', () => {
    expect(escapeCsvCell('Sneha Patel')).toBe('"Sneha Patel"');
    expect(escapeCsvCell('Silver "Bow" Studs')).toBe('"Silver ""Bow"" Studs"');
    expect(escapeCsvCell('Flat 4, MG Road, Mumbai')).toBe('"Flat 4, MG Road, Mumbai"');
  });

  it('neutralizes spreadsheet formula injection starting with =, +, -, @, \\t, \\r', () => {
    // Dangerous spreadsheet formula attempts
    expect(escapeCsvCell('=1+1')).toBe(`"'=1+1"`);
    expect(escapeCsvCell('@SUM(A1:A10)')).toBe(`"'@SUM(A1:A10)"`);
    expect(escapeCsvCell('+919876543210')).toBe(`"'+919876543210"`);
    expect(escapeCsvCell('-100')).toBe(`"'-100"`);
    expect(escapeCsvCell('\tcmd')).toBe(`"'\tcmd"`);
    expect(escapeCsvCell('\rcmd')).toBe(`"'\rcmd"`);
  });

  it('prepends UTF-8 Byte Order Mark (BOM) to CSV output for Excel compatibility', () => {
    const csv = buildOrdersCsv([]);
    expect(csv.startsWith('\uFEFF')).toBe(true);
  });

  it('includes proper header row and formats data rows accurately', () => {
    const sampleRecord: OrderCsvRecord = {
      orderId: 'ord-123',
      enquiryRef: 'BR-8K2A1B',
      createdAt: '2026-10-28T10:00:00Z',
      customerName: 'Ananya Sharma',
      customerPhone: '+91 98765-43210',
      shippingAddress: '42 Lotus Lane, Bandra West, Mumbai 400050',
      itemsSummary: 'Lilac Twist Hoops (Gold) x1',
      totalPaise: 49900,
      status: 'confirmed',
      courier: 'Delhivery',
      trackingNumber: 'DEL123456789',
    };

    const csv = buildOrdersCsv([sampleRecord]);
    const lines = csv.split('\r\n');

    // Header check
    expect(lines[0]).toContain('"Order ID","Enquiry Ref","Date","Customer Name","Phone","Address","Items","Total","Status","Courier","Tracking Number"');

    // Data row checks
    expect(lines[1]).toContain('"ord-123"');
    expect(lines[1]).toContain('"BR-8K2A1B"');
    expect(lines[1]).toContain('"Ananya Sharma"');
    // Formula defense on +91 phone
    expect(lines[1]).toContain(`"'+91 98765-43210"`);
    expect(lines[1]).toContain('"₹499"');
    expect(lines[1]).toContain('"confirmed"');
    expect(lines[1]).toContain('"Delhivery"');
    expect(lines[1]).toContain('"DEL123456789"');
  });
});
