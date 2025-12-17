import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export const runtime = 'nodejs';

export async function GET(req: NextRequest, context: { params: Promise<{ certId: string }> }) {
  try {
    const { certId } = await context.params;
    const db = await getDatabase();
    const cert = await db.collection('certificates').findOne({ id: certId });
    if (!cert) return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });

    const pdf = await PDFDocument.create();
    const page = pdf.addPage([842, 595]); // A4 landscape
    const { width, height } = page.getSize();

    const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const font = await pdf.embedFont(StandardFonts.Helvetica);

    // Background
    page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(1, 1, 1) });

    // Border
    page.drawRectangle({ x: 20, y: 20, width: width - 40, height: height - 40, borderColor: rgb(0.22, 0.27, 0.85), borderWidth: 4 });

    // Title
    const title = 'Certificate of Completion';
    page.drawText(title, { x: 120, y: height - 120, size: 32, font: fontBold, color: rgb(0.16, 0.16, 0.2) });

    // Recipient
    page.drawText(cert.userName, { x: 120, y: height - 180, size: 24, font: fontBold, color: rgb(0.18, 0.35, 0.95) });
    page.drawText('has successfully completed', { x: 120, y: height - 210, size: 14, font, color: rgb(0.2, 0.2, 0.2) });
    page.drawText(cert.courseTitle, { x: 120, y: height - 240, size: 18, font: fontBold, color: rgb(0.1, 0.1, 0.1) });

    // Meta
    page.drawText(`Issued: ${new Date(cert.issuedAt).toLocaleDateString()}`, { x: 120, y: 120, size: 12, font, color: rgb(0.3, 0.3, 0.3) });
    page.drawText(`Certificate ID: ${cert.id}`, { x: 120, y: 100, size: 12, font, color: rgb(0.3, 0.3, 0.3) });
    page.drawText(`Verify: ${cert.verificationUrl}`, { x: 120, y: 80, size: 12, font, color: rgb(0.3, 0.3, 0.3) });

    const bytes = await pdf.save();
    return new NextResponse(Buffer.from(bytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="certificate-${cert.id}.pdf"`,
        'Cache-Control': 'private, max-age=0, no-cache',
      },
    });
  } catch (e: any) {
    console.error('Certificate PDF error:', e);
    return NextResponse.json({ error: 'Failed to generate PDF', message: e.message }, { status: 500 });
  }
}


