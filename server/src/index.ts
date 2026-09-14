import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import invitationRoutes from './routes/invitations.js';
import manageAuthRoutes from './routes/manageAuth.js';
import manageInvitationRoutes from './routes/manageInvitations.js';

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 4000);
const allowedOrigins = new Set(
  [
    process.env.CLIENT_URL,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:5175',
    'http://127.0.0.1:5176',
  ].filter(Boolean) as string[],
);

app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin) || /^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'inv-server', timestamp: new Date().toISOString() });
});

app.get('/api/ready', (_req, res) => {
  res.json({ ready: true, features: ['invitations'] });
});

app.use('/api/invitations', invitationRoutes);
app.use('/api/manage/auth', manageAuthRoutes);
app.use('/api/manage/invitations', manageInvitationRoutes);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
