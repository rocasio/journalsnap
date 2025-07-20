import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Only initialize if not already initialized (important for Vercel)
if (!getApps().length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

export default async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });

  const { timestamp, uid } = req.query;
  if (!timestamp) return res.status(400).json({ error: 'Timestamp is required.' });
  if (!uid) return res.status(400).json({ error: 'User UID is required.' });

  try {
    // Find the document with the matching timestamp and uid
    const snapshot = await db.collection('summaries')
      .where('timestamp', '==', timestamp)
      .where('uid', '==', uid)
      .get();
    if (snapshot.empty) {
      return res.status(404).json({ error: 'Summary not found or does not belong to user.' });
    }
    // Delete all matching documents (should be only one)
    const deletePromises = snapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(deletePromises);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Failed to delete summary from Firestore:', err);
    res.status(500).json({ error: 'Failed to delete summary.' });
  }
}
