// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, deleteUser } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
import { getFirestore, doc, getDoc, collection, getDocs, query, where, setDoc, addDoc } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

// Replace with your actual Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCib5ywnEJvXXIePdWeKZtrKMIi2-Q_9sM",
  authDomain: "geo-orbit-ed7a7.firebaseapp.com",
  databaseURL: "https://geo-orbit-ed7a7-default-rtdb.firebaseio.com",
  projectId: "geo-orbit-ed7a7",
  storageBucket: "geo-orbit-ed7a7.appspot.com",
  messagingSenderId: "807202826514",
  appId: "1:807202826514:web:5630f581f6f9dff46aebcb",
  measurementId: "G-H15DN69132"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // Initialize Firestore

// Function to handle Google Sign-In
async function handleSignIn() {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider); // Sign-in
    const user = result.user;

    // Query the allowedUsers collection for the authenticated user's UID
    const allowedUsersRef = collection(db, 'allowedUsers');
    const q = query(allowedUsersRef, where('uid', '==', user.email.replace("@gmail.com", "")));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) { // If user UID exists in allowedUsers
      console.log("User is allowed to log in.");

      const data1 = querySnapshot.docs[0].data();

      const userRef = doc(db, 'users', user.uid);

      // Check if the user already exists in Firestore
      const userDoc = await getDoc(userRef);

      const userDetails = {
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        EmployeeID: user.email.replace("@gmail.com", ""),
        Role: "Employee",
        Company: data1.company,
      };

      if (!userDoc.exists()) {
        console.log("User not found in Firestore, saving details...");
        await setDoc(userRef, userDetails);
        console.log("User details saved to Firestore!");
      }

      // Log successful login in Firestore
      const loginsRef = collection(db, "logins");
      await addDoc(loginsRef, {
        name: user.displayName,
        email: user.email,
        timestamp: new Date(), // Store login timestamp
      });

      console.log("Login event recorded in Firestore.");

      // Save UID in sessionStorage
      sessionStorage.setItem('userUID', user.uid);
      window.location.href = userDoc.exists() ? "home.html" : "userDetails.html";

    } else {
      console.error("User is not in the allowedUsers collection.");
      await deleteUser(user);
      window.location.href = "notuser.html";
    }

  } catch (error) {
    console.error("Error during sign-in:", error);
    window.location.href = "index.html";
  }
}

// Trigger the function on page load
window.onload = () => {
  setTimeout(() => {
    handleSignIn();
  }, 2000); // Delay for 2 seconds
};
