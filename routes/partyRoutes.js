import express from 'express';
import { getParties } from '../controllers/party.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
    await getParties(req, res, next);
});

export default router;