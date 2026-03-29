import admin from 'firebase-admin';
import serviceAccount from '../et-gen-ai-001-firebase-adminsdk-fbsvc-40fb71846c.json' with { type: 'json' };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export default admin;