import fs from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'

// Use a hidden directory outside the web root for secure storage
const STORAGE_ROOT = path.join(process.cwd(), '.storage')

// Ensure the storage root exists
async function initStorage() {
  try {
    await fs.mkdir(STORAGE_ROOT, { recursive: true })
  } catch (err) {
    console.error("Failed to initialize storage root:", err)
  }
}

// Call once on module load
initStorage()

export const storage = {
  async save(file: File): Promise<{ storageKey: string, sizeBytes: number }> {
    const storageKey = randomUUID()
    const filePath = path.join(STORAGE_ROOT, storageKey)
    
    // Convert File to ArrayBuffer, then to Buffer, and write to disk
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    await fs.writeFile(filePath, buffer)
    
    return { storageKey, sizeBytes: buffer.length }
  },

  async read(storageKey: string): Promise<Buffer | null> {
    const filePath = path.join(STORAGE_ROOT, storageKey)
    try {
      // Basic path traversal prevention
      if (!filePath.startsWith(STORAGE_ROOT)) {
        throw new Error("Invalid storage key")
      }
      return await fs.readFile(filePath)
    } catch {
      return null
    }
  },

  async delete(storageKey: string): Promise<void> {
    const filePath = path.join(STORAGE_ROOT, storageKey)
    try {
      if (filePath.startsWith(STORAGE_ROOT)) {
        await fs.unlink(filePath)
      }
    } catch (err: unknown) {
      if ((err as any).code !== 'ENOENT') {
        throw err
      }
    }
  }
}
