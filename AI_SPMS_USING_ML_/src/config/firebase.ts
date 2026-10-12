import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { connectFirestoreEmulator } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyAsd3uiMqpzZzMyt1F9yApAFuluDvDmd9w",
  authDomain: "studentsdata-007.firebaseapp.com",
  projectId: "studentsdata-007",
  storageBucket: "studentsdata-007.firebasestorage.app",
  messagingSenderId: "140843934899",
  appId: "1:140843934899:web:f2395bc63de98214613cc6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const realtimeDb = getDatabase(app);
export const analytics = getAnalytics(app);

// Connect to emulators in development (optional)
// Uncomment these lines if you want to use Firebase emulators for development
// if (location.hostname === 'localhost') {
//   connectAuthEmulator(auth, 'http://localhost:9099');
//   connectFirestoreEmulator(db, 'localhost', 8080);
// }

export default app;