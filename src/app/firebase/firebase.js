// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCDkyA_EzL99SjudTHAYTwdFi6P--bn5HI",
  authDomain: "redslippers.firebaseapp.com",
  projectId: "redslippers",
  storageBucket: "redslippers.appspot.com",
  messagingSenderId: "263516861210",
  appId: "1:263516861210:web:5982131662655b0c32b2a3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const firestore = getFirestore(app);

export { db, storage, firestore };