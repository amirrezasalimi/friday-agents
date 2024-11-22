import { customAlphabet } from 'nanoid';

const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const defaultLength = 12;

/**
 * Generates a unique ID using nanoid with alphanumeric characters
 * @param length Optional length of the ID (default: 21)
 * @returns A unique string ID
 */
export const generateId = (length: number = defaultLength): string => {
  const nanoid = customAlphabet(alphabet, length);
  return nanoid();
};
