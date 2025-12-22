import app from './app';
import dotenv from 'dotenv';

dotenv.config();

import { createServer } from 'http';
import { initSocket } from './socket';

const PORT = process.env.PORT || 3001;

// Create HTTP server wrapping the Express app
const httpServer = createServer(app);

// Initialize Socket.io
initSocket(httpServer);

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
