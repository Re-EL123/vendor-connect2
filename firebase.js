// firebase.js

// Import only once
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDEsYzVYNvSsKvgFk5cSa_7lWWdJtDc1gs",
  authDomain: "online-mall-4422.firebaseapp.com",
  databaseURL: "https://online-mall-4422-default-rtdb.firebaseio.com",
  projectId: "online-mall-4422",
  storageBucket: "online-mall-4422.appspot.com",
  messagingSenderId: "947082232783",
  appId: "1:947082232783:web:116206502e5fb38383c8ba",
  measurementId: "G-LNTNZQBGL8"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Export Firebase services
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
