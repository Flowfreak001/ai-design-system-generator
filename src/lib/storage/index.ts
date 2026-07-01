// Storage adapter. Abstracts where uploaded assets + large generated binaries
// live. Local dev uses the filesystem under ./.storage; production can swap in
// an S3/R2/Railway-volume adapter behind the same interface without touching
// callers.

import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

export interface StorageAdapter {
  /** Persist bytes, returning an opaque key to store on the row. */
  put(data: Buffer, opts: { ext?: string; contentType?: string }): Promise<string>;
  get(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
  /** A URL/path the app can serve the asset from (local: relative path). */
  urlFor(key: string): string;
}

const ROOT = path.resolve(process.cwd(), ".storage");

class LocalStorage implements StorageAdapter {
  async put(data: Buffer, opts: { ext?: string } = {}): Promise<string> {
    await fs.mkdir(ROOT, { recursive: true });
    const key = `${randomUUID()}${opts.ext ? `.${opts.ext.replace(/^\./, "")}` : ""}`;
    await fs.writeFile(path.join(ROOT, key), data);
    return key;
  }

  async get(key: string): Promise<Buffer> {
    return fs.readFile(path.join(ROOT, safe(key)));
  }

  async delete(key: string): Promise<void> {
    await fs.rm(path.join(ROOT, safe(key)), { force: true });
  }

  urlFor(key: string): string {
    return `/api/assets/${encodeURIComponent(key)}`;
  }
}

// Guard against path traversal in keys.
function safe(key: string): string {
  return path.basename(key);
}

// Swap here when a cloud adapter is added (based on env).
export const storage: StorageAdapter = new LocalStorage();
