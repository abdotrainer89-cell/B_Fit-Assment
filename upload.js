// Vercel serverless function: stores the PDF and returns a public, unguessable download link.
// Setup: Vercel dashboard -> Storage -> create a Blob store and connect it to this project; then redeploy.
import { put } from '@vercel/blob';
import { randomUUID } from 'crypto';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const size = Number(req.headers['content-length'] || 0);
  if (size > 4 * 1024 * 1024) return res.status(413).end();            // Vercel's request-body limit is ~4.5 MB
  try {
    const blob = await put('reports/' + randomUUID() + '.pdf', req, { access: 'public', contentType: 'application/pdf' });
    res.status(200).json({ url: blob.downloadUrl || blob.url });       // downloadUrl forces a file download
  } catch (e) {
    console.error('upload failed:', e);                                 // visible in Vercel -> Logs
    res.status(500).json({ error: String((e && e.message) || e).slice(0, 180) });
  }
}
