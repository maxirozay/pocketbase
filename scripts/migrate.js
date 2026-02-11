import PocketBase from "pocketbase"
import crypto from "node:crypto"
// import { createClient } from '@supabase/supabase-js'
// import firebaseAdmin from 'firebase-admin'

// ==========================================
// CONFIGURATION
// ==========================================
const PB_URL = "http://127.0.0.1:8090"
const PB_ADMIN_EMAIL = "admin@example.com"
const PB_ADMIN_PASSWORD = "password"

// ==========================================
// HELPERS
// ==========================================

/**
 * toPBID generates a 15-character PocketBase-compatible ID
 * from any source string (Firebase ID, Supabase UUID/Int, etc).
 */
export function toPBID(originalId) {
  if (!originalId) return undefined
  const input = String(originalId)
  // 1. Convert input to string
  // 2. Create a hash (MD5 is fast and sufficient for non-cryptographic ID generation)
  const hash = crypto.createHash("md5").update(input).digest("hex")
  // 3. Truncate to 15 characters (PocketBase standard length)
  return hash.substring(0, 15)
}

/**
 * Generic importer function
 */
async function importCollection(pb, collectionName, items, transformFn) {
  console.log(
    `Starting import for ${collectionName} (${items.length} items)...`,
  )
  let success = 0
  let failed = 0

  for (const item of items) {
    try {
      // Apply transformation (renaming fields, mapping IDs)
      const payload = transformFn ? transformFn(item) : item

      // Ensure ID is mapped
      if (!payload.id && item.id) {
        payload.id = toPBID(item.id)
      } else if (!payload.id && item.uid) {
        // Common in Firebase
        payload.id = toPBID(item.uid)
      }

      // Create or Update
      try {
        await pb.collection(collectionName).create(payload)
        success++
      } catch (err) {
        // If it exists, maybe update? Or just log warning.
        if (err.status === 400 && err.response?.data?.id) {
          console.log(`  - Item ${payload.id} already exists. Skipping.`)
        } else {
          throw err
        }
      }
    } catch (err) {
      console.error(`  - Failed to import item:`, err.message)
      failed++
    }
  }
  console.log(
    `Completed ${collectionName}: ${success} OK, ${failed} Failed.\n`,
  )
}

// ==========================================
// MIGRATION LOGIC
// ==========================================

async function main() {
  const pb = new PocketBase(PB_URL)

  // 1. Authenticate as Admin
  console.log("Authenticating...")
  try {
    await pb.admins.authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD)
  } catch (e) {
    console.error(
      "Authentication failed. Make sure PB is running and credentials are correct.",
    )
    process.exit(1)
  }

  // ==========================================
  // SOURCE 1: FIREBASE (Example)
  // ==========================================
  // const serviceAccount = await import('./firebase-service-account.json', { with: { type: "json" } })
  // const fbApp = firebaseAdmin.initializeApp({ credential: firebaseAdmin.credential.cert(serviceAccount.default) })
  // const db = fbApp.firestore()

  // const firebasePostsSnapshot = await db.collection('posts').get()
  // const firebasePosts = firebasePostsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))


  // ==========================================
  // SOURCE 2: SUPABASE (Example)
  // ==========================================
  // const sb = createClient('https://xyz.supabase.co', 'SERVICE_ROLE_KEY')
  // const { data: supabaseUsers } = await sb.from('users').select('*')


  try {
    await importCollection(pb, "users", [], (u) => {
      const password = Math.random().toString(36).slice(5) + Math.random().toString(36).slice(5)
      return {
        id: toPBID(u.id),
        email: u.email,
        password,
        passwordConfirm: password,
        emailVisibility: true
      }
    })
  } catch (e) {
    console.log("User migration skipped (maybe collection missing)")
  }
}

main().catch(console.error)
