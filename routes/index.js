import express from 'express';
import electionRoutes from './electionRoutes.js';
import candidateRoutes from './candidateRoutes.js';
import partyRoutes from './partyRoutes.js';
import voteRoutes from './voteRoutes.js';
import tallyRoutes from './tallyRoutes.js';
import errorHandler from '../middleware/errorHandler.js';
import keyVerificationRoutes from './keyVerificationRoutes.js';

const router = express.Router();

router.get('/', (req, res) => {
    res.send(router.stack);
    });

// Routes
router.use('/election', electionRoutes);
router.use('/candidates', candidateRoutes);
router.use('/parties', partyRoutes);
router.use('/vote', voteRoutes);
router.use('/tally', tallyRoutes);
router.use('/keys', keyVerificationRoutes);

// Error handling middleware
router.use(errorHandler);

export default router;