import { VercelRequest, VercelResponse } from '@vercel/node';
import multer from 'multer';
import pdfParse from 'pdf-parse';

// Use memory storage for file parsing
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  upload.single('pdf')(req as any, {} as any, async (err: any) => {
    if (err) {
      console.error('Upload error:', err.message);
      return res.status(400).json({ 
        error: 'PDF upload failed', 
        details: err.message 
      });
    }
    
    const file = (req as any).file;
    if (!file) {
      return res.status(400).json({ 
        error: 'PDF file missing',
        suggestion: 'Please upload a valid PDF file'
      });
    }
    
    try {
      console.log('Processing PDF file:', file.originalname, 'Size:', file.size);
      const data = await pdfParse(file.buffer);
      
      if (!data.text || data.text.trim().length === 0) {
        return res.status(422).json({ 
          error: 'PDF parsing failed',
          details: 'The PDF appears to be image-based or has complex formatting',
          suggestion: 'Please use a text-based PDF or copy-paste the content manually'
        });
      }
      
      res.status(200).json({ 
        text: data.text,
        metadata: {
          pages: data.numpages || 1,
          length: data.text.length
        }
      });
    } catch (e: any) {
      console.error('PDF parsing error:', e.message);
      res.status(500).json({ 
        error: 'PDF processing failed',
        details: e.message,
        suggestion: 'The PDF may be corrupted or password-protected'
      });
    }
  });
}
