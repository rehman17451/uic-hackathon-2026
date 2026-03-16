// import { initializeApp } from 'firebase/app';
// import { getFirestore } from 'firebase/firestore';
// import { getAuth } from 'firebase/auth';

// ----------------------------------------------------
// INSTRUCTIONS TO CONFIGURE FIREBASE:
// 1. Go to https://console.firebase.google.com/
// 2. Create a new Free Tier project
// 3. Add a "Web App" to the project
// 4. Copy the firebaseConfig object below
// 5. Enable "Firestore Database" and "Authentication" in the console
// ----------------------------------------------------

// const firebaseConfig = {
//   apiKey: "YOUR_FIREBASE_API_KEY",
//   authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
//   projectId: "YOUR_PROJECT_ID",
//   storageBucket: "YOUR_PROJECT_ID.appspot.com",
//   messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
//   appId: "YOUR_APP_ID"
// };

// Initialize Firebase (Uncomment below when config is added)
// export const app = initializeApp(firebaseConfig);
// export const auth = getAuth(app);
// export const db = getFirestore(app);

// NOTE: Currently, state uses Zustand for local simulation.
// To fully connect Firebase, you would link the Zustand actions 
// in `store/useTransactionStore.ts` to `addDoc` and `onSnapshot` from Firestore.
