
import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { createServer as createViteServer } from 'vite';
import { initDatabase } from './server/db/store.js';
import adminRoutes from './server/routes/admin.js';
import authRoutes from './server/routes/auth.js';
import budgetRoutes from './server/routes/budgets.js';
import transactionRoutes from './server/routes/transactions.js';

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  const dbInfo = await initDatabase();
  const app = express();

  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'SpendWise API',
      storage: dbInfo.mode,
    });
  });

  app.use('/api/admin', adminRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/transactions', transactionRoutes);
  app.use('/api/budgets', budgetRoutes);

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  // Render requires the server to listen on 0.0.0.0
  app.listen(PORT, '0.0.0.0', () => {
    console.log(
      `SpendWise server listening on port ${PORT} (${dbInfo.mode})`
    );
  });
}

startServer().catch((err) => {
  console.error('Failed to start SpendWise server:', err);
  process.exit(1);
});
