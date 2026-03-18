import bcrypt from "bcryptjs"

const SALT_ROUNDS = 12

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // Support legacy plaintext passwords during migration
  if (!hash.startsWith("$2a$") && !hash.startsWith("$2b$") && !hash.startsWith("$2y$")) {
    return password === hash
  }
  return bcrypt.compare(password, hash)
}
