import express from 'express';
import electionRoutes from './electionRoutes.js';
import candidateRoutes from './candidateRoutes.js';
import partyRoutes from './partyRoutes.js';
import voteRoutes from './voteRoutes.js';
import tallyRoutes from './tallyRoutes.js';
import errorHandler from '../middleware/errorHandler.js';

const router = express.Router();

router.get('/', (req, res) => {
    res.send(router.stack);
    });

// Routes
router.use('/election', electionRoutes);
router.use('/candidate', candidateRoutes);
router.use('/party', partyRoutes);
router.use('/vote', voteRoutes);
router.use('/tally', tallyRoutes);

// Error handling middleware
router.use(errorHandler);

export default router;