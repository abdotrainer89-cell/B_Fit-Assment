// Vercel serverless function: stores the PDF and returns a public, unguessable download link.
// Needs: package.json with "@vercel/blob", and a Blob store connected to the project (Vercel -> Storage).
import { randomUUID } from 'crypto';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).end();

    // read the uploaded PDF into memory (Vercel's request-body limit is ~4.5 MB)
    const MAX = 4 * 1024 * 1024, chunks = []; let size = 0;
    for await (const c of req) {
      size += c.length;
      if (size > MAX) return res.status(413).end();
      chunks.push(c);
    }
    const body = Buffer.concat(chunks);
    if (!body.length) return res.status(400).json({ error: 'empty body' });

    // loaded inside try{} so a missing package / bad setup is reported instead of crashing the function
    const { put } = await import('@vercel/blob');
    const blob = await put('reports/' + randomUUID() + '.pdf', body, { access: 'public', contentType: 'application/pdf' });
    return res.status(200).json({ url: blob.downloadUrl || blob.url });   // downloadUrl forces a file download
  } catch (e) {
    console.error('upload failed:', e);                                    // visible in Vercel -> Logs
    return res.status(500).json({ error: String((e && e.message) || e).slice(0, 180) });
  }
}
