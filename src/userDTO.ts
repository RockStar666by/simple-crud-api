import { v4 as uuidv4 } from 'uuid';
import { IUser } from './utils/interfaces';

export class UserDTO {
  id: string;
  username: string;
  age: number;
  hobbies: Array<string>;

  constructor(data: Omit<IUser, 'id'>) {
    this.username = data.username;
    this.age = data.age;
    this.hobbies = data.hobbies;
    this.id = uuidv4();
  }
}
