import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { apiRouter } from './server/routes.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  
  // Read PORT from environment variable as required by Cloud Run (fallback to 3000)
  const PORT = Number(process.env.PORT) || 3000;
  const distPath = path.resolve(__dirname, 'dist');
  const hasDist = fs.existsSync(path.join(distPath, 'index.html'));
  const isProduction = process.env.NODE_ENV === 'production' || hasDist;

  // Body parsers with large limit for file uploads / documents
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Root health check endpoint for Cloud Run container probes
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', service: 'StudyProgress', timestamp: new Date().toISOString() });
  });

  // API router
  app.use('/api', apiRouter);

  // API health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', service: 'StudyProgress API', timestamp: new Date().toISOString() });
  });

  if (!isProduction) {
    // Development mode: Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: serve built assets
    if (!hasDist) {
      console.warn('Production build dist/index.html not found. Building with vite build...');
      try {
        const { execSync } = await import('child_process');
        execSync('npm run build', { stdio: 'inherit' });
      } catch (err) {
        console.error('Auto-build failed:', err);
      }
    }

    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Ensure the server listens on 0.0.0.0:${process.env.PORT || 3000}
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StudyProgress production server listening on 0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup failure:', err);
  process.exit(1);
});
