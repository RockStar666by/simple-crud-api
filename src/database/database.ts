import { UserDTO } from '../userDTO';
import { userSchema } from '../utils/config';
import { IUser } from '../utils/interfaces';

export class DB {
  users: Array<IUser> = [];

  checkUserData(data: Omit<IUser, 'id'>, schema: Map<string, string>) {
    const keys = Array.from(schema.keys()).filter((key) => !data[key]);
    if (keys.length) return true;
    return false;
  }

  async getUsers() {
    return this.users;
  }

  async getUser(id: string) {
    const found = await this.users.find((user) => user.id === id);
    return found || null;
  }

  async addUser(payload: Omit<IUser, 'id'>) {
    const isValid = this.checkUserData(payload, userSchema);
    if (isValid) {
      return {
        data: null,
        error: 'Request does not contain required fields'
      };
    }
    const newItem = new UserDTO(payload) as IUser;
    this.users.push(newItem);
    return {
      data: newItem,
      error: ''
    };
  }

  async updateUser(id: string, data: Partial<Omit<IUser, 'id'>>) {
    const found = await this.users.findIndex((user) => user.id === id);
    if (found < 0) {
      return {
        data: null,
        error: 'Record does not exist'
      };
    }
    const item = { ...this.users[found], ...data };
    this.users[found] = item;
    return {
      user: this.users.find((user) => user.id === id),
      error: ''
    };
  }

  async deleteUser(id: string) {
    const found = await !!this.users.find((user) => user.id === id);
    this.users = await this.users.filter((user) => user.id !== id);
    return found ? true : false;
  }
}

export const db = new DB();
