
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Only initialize if not already initialized (important for Vercel)
if (!getApps().length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // Get all summaries from Firestore
    const snapshot = await db.collection('summaries').orderBy('timestamp', 'desc').get();
    const summaries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(summaries);
  } catch (err) {
    console.error('Failed to fetch summaries from Firestore:', err);
    // Always return an empty array on error to avoid frontend JSON parse errors
    res.status(200).json([]);
  }
}