// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
import { getFirestore, doc, setDoc } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

// Replace with your actual Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCib5ywnEJvXXIePdWeKZtrKMIi2-Q_9sM",
  authDomain: "geo-orbit-ed7a7.firebaseapp.com",
  databaseURL: "https://geo-orbit-ed7a7-default-rtdb.firebaseio.com",
  projectId: "geo-orbit-ed7a7",
  storageBucket: "geo-orbit-ed7a7.firebasestorage.app",
  messagingSenderId: "807202826514",
  appId: "1:807202826514:web:5630f581f6f9dff46aebcb",
  measurementId: "G-H15DN69132"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // Initialize Firestore

// Google Sign-In button functionality
const signInButton = document.getElementById('googlesign');
signInButton.addEventListener('click', async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);  // Sign-in
    const user = result.user;
    console.log("Authenticated user:", user.uid);  // Log authenticated user's UID
    alert("Logged in successfully with Google!");
    
    // Store user details in Firestore
    const userRef = doc(db, 'users', user.uid);
    const userDetails = {
      name: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      age: '',  // Store the user's age here
      mobileNumber: '',  // Store the user's mobile number here
    };
    
    // sessionStorage.setItem('userUID', user.uid);  // Save UID in sessionStorage

    // Save user details to Firestore
    // await setDoc(userRef, userDetails);

    // Redirect to user details page
    window.location.href = "userDetails.html";  // Redirect after sign-in

  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.error(errorCode, errorMessage);
  }
});


