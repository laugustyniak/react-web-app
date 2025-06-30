import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import type { Application, Request, Response, NextFunction } from 'express';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createHttpsServer(app: Application): https.Server | null {
  const certPath = path.join(__dirname, '../../certs', 'localhost.crt');
  const keyPath = path.join(__dirname, '../../certs', 'localhost.key');

  if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    const httpsOptions = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath)
    };

    return https.createServer(httpsOptions, app);
  }

  return null;
}

export function setupHttpsRedirect(app: Application): void {
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}

export function checkSslCerts(): boolean {
  const certPath = path.join(__dirname, '../../certs', 'localhost.crt');
  const keyPath = path.join(__dirname, '../../certs', 'localhost.key');
  
  return fs.existsSync(certPath) && fs.existsSync(keyPath);
}
