import express from 'express';
import router from './routes/index.js';
import { PORT } from './config/config.js';
import { connectToDb } from './db/index.js';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();

// Set a higher limit for JSON body parser
app.use(bodyParser.json({ limit: '50mb' }));

app.use(cors());
app.use('/', router);

connectToDb(process.env.MONGO_URI);

// Start the server
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on port ${PORT}`);
});