// Vercel serverless entrypoint: every /api/* request is rewritten here (see vercel.json).
import { createHandler } from '../server.mjs';

export default createHandler();
