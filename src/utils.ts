import { randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

export async function hashPassord(password: string): Promise<[string, string]> {
  const salt = randomBytes(8).toString('hex');
  const hashBuffer = (await promisify(scrypt)(password, salt, 64)) as Buffer;
  const hash = hashBuffer.toString('hex');
  return [hash, salt];
}

export async function checkPassword(
  password: string,
  salt: string,
  hash: string,
) {
  const hashBuffer = (await promisify(scrypt)(password, salt, 64)) as Buffer;
  const calculatedHash = hashBuffer.toString('hex');
  return calculatedHash === hash;
}

export function sample<T>(array: T[]) {
  const index = Math.floor(Math.random() * array.length);
  return array[index];
}
