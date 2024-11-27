import { config } from 'dotenv';

// Load environment variables based on NODE_ENV


if (!process.env.GITHUB_ACTIONS) {
  if (process.env.NODE_ENV === 'production') {
    config({ path: './.env.prod' });
  } else {
    config({ path: './.env' });
  }
}

// Access the environment variables
const keys = {
  mongoURI: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET
};

export default keys;