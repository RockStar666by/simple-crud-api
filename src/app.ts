import http from 'http';
import { uuidRegExp, pathRegExp } from './utils/config';
import { DB } from './database/database';

export class AppServer {
  private db: DB;
  endpointPost: {
    id: RegExp | null;
    path: RegExp;
    method: (request: http.IncomingMessage, response: http.ServerResponse, id?: string) => void;
  }[];
  private endpointGet: {
    id: RegExp | null;
    path: RegExp;
    method: (request: http.IncomingMessage, response: http.ServerResponse, id?: string) => void;
  }[];
  private endpointPut: {
    id: RegExp | null;
    path: RegExp;
    method: (request: http.IncomingMessage, response: http.ServerResponse, id?: string) => void;
  }[];
  private endpointDelete: {
    id: RegExp | null;
    path: RegExp;
    method: (request: http.IncomingMessage, response: http.ServerResponse, id?: string) => void;
  }[];

  constructor(database: DB) {
    this.db = database;
    this.endpointPost = [
      {
        id: null,
        path: /^\/api\/users$/,
        method: this.addUser.bind(this)
      }
    ];

    this.endpointGet = [
      {
        id: null,
        path: /^\/api\/users$/,
        method: this.getUsers.bind(this)
      },
      {
        id: uuidRegExp,
        path: pathRegExp,
        method: this.getUser.bind(this)
      }
    ];

    this.endpointPut = [
      {
        id: uuidRegExp,
        path: pathRegExp,
        method: this.updateUser.bind(this)
      }
    ];

    this.endpointDelete = [
      {
        id: uuidRegExp,
        path: pathRegExp,
        method: this.deleteUser.bind(this)
      }
    ];
  }

  checkIdValidity(id: string, regex: RegExp | null) {
    if (!regex) return true;
    return id.match(regex);
  }

  nonExistence(request: http.IncomingMessage, response: http.ServerResponse) {
    response.statusCode = 404;
    response.write(`The endpoint ${decodeURI(request.url)} does not exists`);
    response.end();
  }

  getRequestId(input: string) {
    return decodeURI(input).replace('/api/users', '').replace('/', '').replace('$', '').replace('{', '').replace('}', '');
  }

  addUser(request: http.IncomingMessage, response: http.ServerResponse) {
    try {
      let body = '';
      request.on('data', function (chunk) {
        body += chunk;
      });
      request.on('end', async () => {
        const { data, error } = await this.db.addUser(JSON.parse(body));
        if (error) {
          response.statusCode = 404;
          response.write(JSON.stringify({ error }));
          response.end();
        } else {
          response.statusCode = 201;
          response.write(JSON.stringify(data));
          response.end();
        }
      });
    } catch (error) {
      response.statusCode = 500;
      response.write(JSON.stringify({ error: 'Server error' }));
      response.end();
    }
  }

  async getUsers(request: http.IncomingMessage, response: http.ServerResponse, id = '') {
    try {
      const users = await this.db.getUsers();
      response.statusCode = 200;
      response.write(JSON.stringify(users));
      response.end();
    } catch (error) {
      response.statusCode = 500;
      response.write(JSON.stringify({ error: 'Server error' }));
      response.end();
    }
  }

  async getUser(request: http.IncomingMessage, response: http.ServerResponse, id: string) {
    try {
      const user = await this.db.getUser(id);
      if (!user) {
        response.statusCode = 404;
        response.write(JSON.stringify({ error: 'Record does not exist' }));
        response.end();
      } else {
        response.statusCode = 200;
        response.write(JSON.stringify(user));
        response.end();
      }
    } catch (error) {
      response.statusCode = 500;
      response.write(JSON.stringify({ error: 'Server error' }));
      response.end();
    }
  }

  updateUser(request: http.IncomingMessage, response: http.ServerResponse, id: string) {
    try {
      let body = '';
      request.on('data', function (chunk) {
        body += chunk;
      });

      request.on('end', async () => {
        const { user, error } = await this.db.updateUser(id, JSON.parse(body));

        if (error) {
          response.statusCode = 404;
          response.write(JSON.stringify({ error: 'Record does not exist' }));
          response.end();
        } else {
          response.statusCode = 200;
          response.write(JSON.stringify(user));
          response.end();
        }
      });
    } catch (error) {
      response.statusCode = 500;
      response.write(JSON.stringify({ error: 'Server error' }));
      response.end();
    }
  }

  async deleteUser(request: http.IncomingMessage, response: http.ServerResponse, id: string) {
    try {
      const result = await this.db.deleteUser(id);
      if (!result) {
        response.statusCode = 404;
        response.write(JSON.stringify({ error: 'Record does not exist' }));
        response.end();
      } else {
        response.statusCode = 204;
        response.end();
      }
    } catch (error) {
      response.statusCode = 500;
      response.write(JSON.stringify({ error: 'Server error' }));
      response.end();
    }
  }

  onPostMethod(request: http.IncomingMessage, response: http.ServerResponse) {
    const id = this.getRequestId(request.url);
    const found = this.endpointPost.find((item) => decodeURI(request.url).match(item.path));

    if (!found) {
      this.nonExistence(request, response);
    } else {
      const isIdValid = this.checkIdValidity(id, found.id);
      if (!isIdValid) {
        response.statusCode = 400;
        response.write(JSON.stringify({ error: `User Id is invalid` }));
        response.end();
      } else {
        found.method(request, response, id);
      }
    }
  }

  onGetMethod(request: http.IncomingMessage, response: http.ServerResponse) {
    const id = this.getRequestId(request.url);
    const found = this.endpointGet.find((item) => decodeURI(request.url).match(item.path));

    if (!found) {
      this.nonExistence(request, response);
    } else {
      const isIdValid = this.checkIdValidity(id, found.id);
      if (!isIdValid) {
        response.statusCode = 400;
        response.write(JSON.stringify({ error: `User Id is invalid` }));
        response.end();
      } else {
        found.method(request, response, id);
      }
    }
  }

  onPutMethod(request: http.IncomingMessage, response: http.ServerResponse) {
    const id = this.getRequestId(request.url);
    const found = this.endpointPut.find((item) => decodeURI(request.url).match(item.path));

    if (!found) {
      this.nonExistence(request, response);
    } else {
      const isIdValid = this.checkIdValidity(id, found.id);
      if (!isIdValid) {
        response.statusCode = 400;
        response.write(JSON.stringify({ error: `User Id is invalid` }));
        response.end();
      } else {
        found.method(request, response, id);
      }
    }
  }

  onDeleteMethod(request: http.IncomingMessage, response: http.ServerResponse) {
    const id = this.getRequestId(request.url);
    const found = this.endpointDelete.find((item) => decodeURI(request.url).match(item.path));

    if (!found) {
      this.nonExistence(request, response);
    } else {
      const isIdValid = this.checkIdValidity(id, found.id);
      if (!isIdValid) {
        response.statusCode = 400;
        response.write(JSON.stringify({ error: `User Id is invalid` }));
        response.end();
      } else {
        found.method(request, response, id);
      }
    }
  }

  onRequest(request: http.IncomingMessage, response: http.ServerResponse) {
    response.setHeader('Content-Type', 'application/json');

    if (request.method === 'POST') {
      this.onPostMethod(request, response);
    }
    if (request.method === 'GET') {
      this.onGetMethod(request, response);
    }
    if (request.method === 'PUT') {
      this.onPutMethod(request, response);
    }
    if (request.method === 'DELETE') {
      this.onDeleteMethod(request, response);
    }
  }
}
