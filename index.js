import express from 'express';
import router from './routes/index.js';
import { PORT } from './config/config.js';
import { connectToDb } from './db/index.js';

const app = express();
app.use(express.json());

app.use('/', router);

connectToDb(process.env.MONGO_URI);

// Start the server
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on port ${PORT}`);
});