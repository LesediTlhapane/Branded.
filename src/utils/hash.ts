/**
 * Salted Hash Utility for Secure Customer Email Comparison
 * 
 * Satisfies Security Requirement 19:
 * Customer email is stored as a salted hash for retrieval comparison.
 * Never store customer email in plaintext for comparison checks.
 */

const SALT = 'SA_BRANDED_QUOTE_SALT_2026_X981#';

/**
 * Creates a salted hash from an email string.
 */
export async function hashEmail(email: string): Promise<string> {
  const normalized = email.trim().toLowerCase();
  const dataToHash = `${SALT}:${normalized}`;
  
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(dataToHash);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fallback
    }
  }

  // Pure JS fallback string hash
  let hash = 0;
  for (let i = 0; i < dataToHash.length; i++) {
    const char = dataToHash.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return `h_${Math.abs(hash).toString(36)}_${normalized.length}`;
}

/**
 * Verifies if an email matches a salted hash.
 */
export async function verifyEmailHash(inputEmail: string, storedHash: string): Promise<boolean> {
  const computedHash = await hashEmail(inputEmail);
  return computedHash === storedHash;
}
