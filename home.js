// / Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

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


// Check if user is authenticated
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    console.log("No user is authenticated!");
    alert("Please sign in to proceed.");
    window.location.href="index.html";
  } else {
    console.log("Authenticated user:", user.uid);

    // Now, fetch user data from Firestore
    const userRef = doc(db, "users", user.uid); // Reference to the user's document
    try {
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        // User data exists, retrieve and display it
        const userData = userDoc.data();
        console.log("User data:", userData);

      
        document.getElementById("logo").src = userData.photoURL || "default-profile-pic.png"; // Fallback to default image
        
        console.log(userData.age);
      } else {
        console.log("No user data found in Firestore.");
      }
    } catch (error) {
      console.error("Error fetching user data from Firestore:", error);
    }
  }
});
