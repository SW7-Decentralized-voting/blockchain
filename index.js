import express from 'express';
import router from './routes/index.js';
import { PORT } from './config/config.js';

const app = express();
app.use(express.json());

app.use('/', router);

// Start the server
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on port ${PORT}`);
});