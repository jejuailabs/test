import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

await auth.authStateReady();

window.LAUNCHOPS_AUTH = {
  user: auth.currentUser,
  signIn: () => signInWithPopup(auth, provider),
  signOut: () => signOut(auth)
};

await import('./app.js');
