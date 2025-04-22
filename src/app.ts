import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/config';
import userRoutes from './routes/user';
import eventRoutes from './routes/event';
import engagementRoutes from './routes/engagement';
import pointsRoutes from './routes/points';
import configRoutes from './routes/config';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/config', configRoutes);
app.use('/api/engagement', engagementRoutes);
app.use('/api/event', eventRoutes);
app.use('/api/points', pointsRoutes);
app.use('/api/user', userRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
});

export default app;