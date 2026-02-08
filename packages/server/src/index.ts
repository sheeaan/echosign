import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import encodeRouter from './routes/encode';
import decodeRouter from './routes/decode';
import sttRouter from './routes/stt';
import ttsRouter from './routes/tts';
import classifyRouter from './routes/classify';
import incidentsRouter from './routes/incidents';
// import auditRouter from './routes/audit.js'; // Solana — skipped for now

// Load .env from project root (two directories up from this file)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const app = express();
const PORT = parseInt(process.env.PORT ?? '3001');

app.use(cors());
app.use(express.json());

// API routes
app.use('/api', encodeRouter);
app.use('/api', decodeRouter);
app.use('/api', sttRouter);
app.use('/api', ttsRouter);
app.use('/api', classifyRouter);
app.use('/api', incidentsRouter);
// app.use('/api', auditRouter); // Solana — skipped for now

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.listen(PORT, () => {
  console.log(`EchoSign server running on http://localhost:${PORT}`);
});
