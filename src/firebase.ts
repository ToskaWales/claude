import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDWglGTCmw4Nl6NcUbVlmbrjfg-QoVJxp4",
  authDomain: "pauls-frisur-stube.firebaseapp.com",
  projectId: "pauls-frisur-stube",
  storageBucket: "pauls-frisur-stube.firebasestorage.app",
  messagingSenderId: "198101910306",
  appId: "1:198101910306:web:0588b28824251835969b7b",
  measurementId: "G-392F53QCKT",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
