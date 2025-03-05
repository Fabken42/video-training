// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDzruRdVX2mAyBZLCUddUyZ625O6sH2uYk",
  authDomain: "video-training-ca78a.firebaseapp.com",
  projectId: "video-training-ca78a",
  storageBucket: "video-training-ca78a.firebasestorage.app",
  messagingSenderId: "787631204925",
  appId: "1:787631204925:web:519d688d532242b3c65854",
  measurementId: "G-X7BLBWR5X2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup };