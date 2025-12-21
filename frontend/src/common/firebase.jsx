import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth, signInWithPopup, signInWithRedirect } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyDZygT5wcdtQx9_fAG-WqhmWphiqq7OjmM",
  authDomain: "mern-blog-website-15a5d.firebaseapp.com",
  projectId: "mern-blog-website-15a5d",
  storageBucket: "mern-blog-website-15a5d.firebasestorage.app",
  messagingSenderId: "446835491334",
  appId: "1:446835491334:web:01290173f45048a852f987",
  measurementId: "G-B3J2TKD7K8"
};

const app = initializeApp(firebaseConfig);

const provider = new GoogleAuthProvider();

const auth = getAuth(app);

export const authWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, provider);

        const user = result.user;
        const idToken = await user.getIdToken();
        return { user, idToken };
    } catch (err) {
        console.error("Google sign-in error:", err);
        return null;
    }
}