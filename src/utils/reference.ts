import { RefPattern } from '../types';

const AMBIGUITY_SAFE_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Excludes 0, O, 1, I, L
const ALPHANUMERIC_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function generateRandomString(length: number, charset: string): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    result += charset[randomIndex];
  }
  return result;
}

/**
 * Generates non-sequential, unpredictable quote reference numbers.
 * Example outputs:
 * - QS-7X9K2M (ALPHANUMERIC)
 * - QS-20260814-K92X (DATE_SUFFIX)
 * - QS-8N3P7W (AMBIGUITY_SAFE)
 */
export function generateReferenceNumber(
  prefix: string = 'QS-',
  pattern: RefPattern = 'AMBIGUITY_SAFE'
): string {
  const cleanPrefix = prefix ? prefix.trim().toUpperCase() : 'QS-';
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD

  switch (pattern) {
    case 'DATE_SUFFIX': {
      const suffix = generateRandomString(4, AMBIGUITY_SAFE_CHARS);
      return `${cleanPrefix}${dateStr}-${suffix}`;
    }
    case 'ALPHANUMERIC': {
      const randomStr = generateRandomString(6, ALPHANUMERIC_CHARS);
      return `${cleanPrefix}${randomStr}`;
    }
    case 'AMBIGUITY_SAFE':
    default: {
      const randomStr = generateRandomString(6, AMBIGUITY_SAFE_CHARS);
      return `${cleanPrefix}${randomStr}`;
    }
  }
}
