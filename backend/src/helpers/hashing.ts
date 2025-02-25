import * as bcrypt from 'bcrypt';

export function createHash(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export function validateHash(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
