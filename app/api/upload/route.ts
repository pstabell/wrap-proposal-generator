import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { guardPublicRoute, looksLikePdf, MAX_PDF_BYTES } from '@/lib/request-guard';

// Only the policy-document PDFs are uploaded here; images are read in the
// browser as data URLs and never reach this route.
export async function POST(request: NextRequest) {
  const blocked = guardPublicRoute(request, 'upload', 30, 10 * 60 * 1000);
  if (blocked) return blocked;

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size === 0 || file.size > MAX_PDF_BYTES) {
      return NextResponse.json(
        { error: `File size exceeds ${MAX_PDF_BYTES / (1024 * 1024)}MB limit` },
        { status: 400 },
      );
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!looksLikePdf(bytes)) {
      return NextResponse.json({ error: 'Only PDF files can be uploaded' }, { status: 400 });
    }

    const safeName =
      (file.name || 'document.pdf').replace(/[^A-Za-z0-9._-]+/g, '_').slice(0, 100) || 'document.pdf';
    const pathname = safeName.toLowerCase().endsWith('.pdf') ? safeName : `${safeName}.pdf`;

    const blob = await put(pathname, Buffer.from(bytes), {
      access: 'public',
      addRandomSuffix: true,
      contentType: 'application/pdf',
    });

    return NextResponse.json({
      url: blob.url,
      filename: file.name,
      size: file.size,
      contentType: 'application/pdf',
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
