import mongoose from 'mongoose';
import { config } from './config/config';
import app from './app';

/**
 * Starts the server by connecting to MongoDB and then listening on the specified port.
 * 
 * @async
 * @function startServer
 * @throws Will throw an error if the server fails to start.
 * @returns {Promise<void>} A promise that resolves when the server is successfully started.
 */

const startServer = async () => {
  try {
    await mongoose.connect(config.mongodb.uri);
    console.log('Connected to MongoDB');

    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();