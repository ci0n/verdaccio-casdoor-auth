import NodeCache from 'node-cache';

import Crypto, { scryptSync } from 'crypto';

export class AuthenticateStore {

  private storage: NodeCache;

  constructor() {
    this.storage = new NodeCache({
      stdTTL: 300,
      useClones: false,
    })
  }


  public findUser(username: string, password: string) {
    const user = this.storage.get<User>(AuthenticateStore.generateKeyHash(username, password));
    return user;
  }

  public storeUser(username: string, password: string, user: User) {
    const key = AuthenticateStore.generateKeyHash(username, password);
    const success = this.storage.set(key, user);
    return success
  }


  private static generateKeyHash(username: string, password: string) {
    const sha = Crypto.createHash('sha256');
    sha.update(JSON.stringify({ username: username, password: password }));
    return sha.digest('hex');
  }
}


export class User {
  public readonly access_token: string;
  public readonly refresh_token: string;
  public readonly isAdmin: boolean;
  public readonly groups: string[];

  constructor(user: User) {
    Object.assign(this, user);
  }
}
