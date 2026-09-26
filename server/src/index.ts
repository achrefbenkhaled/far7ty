import express from 'express';
import invitationsRouter from './routes/invitations.js';
import manageInvitationsRouter from './routes/manageInvitations.js';
import manageAuthRouter from './routes/manageAuth.js';
import mapsRouter from './routes/maps.js';
import authRouter from './routes/auth.js';
import memoriesRouter from './routes/memories.js';
import manageMemoriesRouter from './routes/manageMemories.js';

const app = express();

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/invitations', invitationsRouter);
app.use('/api/manage/auth', manageAuthRouter);
app.use('/api/manage/invitations', manageInvitationsRouter);
app.use('/api/maps', mapsRouter);
app.use('/api/auth', authRouter);
app.use('/api/memories', memoriesRouter);
app.use('/api/manage/invitations', manageMemoriesRouter);

export default app;
