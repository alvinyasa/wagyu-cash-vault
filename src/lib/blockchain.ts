// Mock blockchain layer — generates realistic-looking tx hashes for the MVP.
// Bisa diganti dengan integrasi smart contract Solidity (Sepolia) nanti.

export async function generateTxHash(payload: Record<string, unknown>): Promise<string> {
  const data = JSON.stringify({ ...payload, ts: Date.now(), nonce: crypto.randomUUID() });
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(data));
  const hex = Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return "0x" + hex;
}

export function shortHash(hash: string | null | undefined): string {
  if (!hash) return "—";
  return `${hash.slice(0, 10)}…${hash.slice(-6)}`;
}

export function explorerUrl(hash: string): string {
  // Placeholder explorer link; bisa diarahkan ke Etherscan saat sudah on-chain
  return `https://sepolia.etherscan.io/tx/${hash}`;
}
