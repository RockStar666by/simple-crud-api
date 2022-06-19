import { AppServer } from './app';
import dotenv from 'dotenv';
import http from 'http';
import { DB } from './database/database';

export class Server {
  constructor(private db: DB) {
    dotenv.config();
    const pid = process.pid;
    const PORT = process.env.PORT || 8080;
    const app = new AppServer(db);
    const server = http.createServer((request, response) => {
      app.onRequest(request, response);
      console.log(`process id: ${pid} got a message`);
    });

    server.listen(PORT, () => {
      console.log(`server is listening on ${PORT}, process id: ${pid}`);
    });
  }
}
