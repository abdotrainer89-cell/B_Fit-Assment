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
