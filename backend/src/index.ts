import * as dotenv from 'dotenv';
dotenv.config();

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Application specific logging, throwing an error, or other logic here
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // Be careful here, some exceptions leave the process in an indeterminate state
    // but for dev it helps see what happened without a silent death
});

import app from './app';

import { createServer } from 'http';
import { initSocket } from './socket';

const PORT = process.env.PORT || 3001;

// Create HTTP server wrapping the Express app
const httpServer = createServer(app);

// Initialize Socket.io
initSocket(httpServer);

httpServer.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
