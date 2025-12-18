import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  // Serve index.html per tutte le rotte non-API
  const indexPath = path.join(process.cwd(), '.vercel', 'output', 'static', 'index.html');
  
  if (fs.existsSync(indexPath)) {
    const html = fs.readFileSync(indexPath, 'utf8');
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  } else {
    res.status(404).send('Not found');
  }
}
