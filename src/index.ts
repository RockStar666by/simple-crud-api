import { db } from './database/database';
import { Server } from './server';

const server = new Server(db);
