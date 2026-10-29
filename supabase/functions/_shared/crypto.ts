// Web Crypto AES-256-GCM encryption for storing GitHub access tokens safely
export async function encryptToken(plainText: string, secretKeyHex: string): Promise<{
  cipherText: string;
  iv: string;
  tag?: string;
}> {
  // If no 32-byte secret provided, fallback to default derived key
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secretKeyHex.padEnd(32, '0').slice(0, 32));

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = encoder.encode(plainText);

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    encoded
  );

  const cipherBytes = new Uint8Array(encryptedBuffer);
  const cipherBase64 = btoa(String.fromCharCode(...cipherBytes));
  const ivBase64 = btoa(String.fromCharCode(...iv));

  return {
    cipherText: cipherBase64,
    iv: ivBase64,
  };
}

export async function decryptToken(cipherBase64: string, ivBase64: string, secretKeyHex: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secretKeyHex.padEnd(32, '0').slice(0, 32));

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );

  const cipherBytes = Uint8Array.from(atob(cipherBase64), (c) => c.charCodeAt(0));
  const ivBytes = Uint8Array.from(atob(ivBase64), (c) => c.charCodeAt(0));

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivBytes },
    cryptoKey,
    cipherBytes
  );

  return new TextDecoder().decode(decryptedBuffer);
}
