import express from 'express';
import pkg from 'hardhat';
import electionRoutes from './routes/electionRoutes.js';
import candidateRoutes from './routes/candidateRoutes.js';
import partyRoutes from './routes/partyRoutes.js';
import voteRoutes from './routes/voteRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import { PORT } from './config/config.js';

const { ethers } = pkg;
const app = express();
app.use(express.json());

// Routes
app.use('/election', electionRoutes);
app.use('/candidate', candidateRoutes);
app.use('/party', partyRoutes);
app.use('/vote', voteRoutes);

// Error handling middleware
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});