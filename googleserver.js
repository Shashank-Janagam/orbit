// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
import { getFirestore, doc,getDoc,collection, getDocs, query, where ,setDoc} from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

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
    const result = await signInWithPopup(auth, provider); // Sign-in
    const user = result.user;

    // Query the allowedUsers collection for the authenticated user's UID
    const allowedUsersRef = collection(db, 'allowedUsers');
    const q = query(allowedUsersRef, where('uid', '==', user.email.replace("@gmail.com","")));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) { // If user UID exists in allowedUsers
      console.log("User is allowed to log in.");


      
          const userRef = doc(db, 'users', user.uid);
      
          // Check if the user already exists in Firestore
          const userDoc = await getDoc(userRef);  // Fetch the user document
          // const e=user.email;
      
          if (!userDoc.exists()) {  // If user data does not exist
            console.log("User not found in Firestore, saving details...");
      
            const userDetails = {
              name: user.displayName,
              email: user.email,
              photoURL: user.photoURL,
              EmployeeID:user.email.replace("@gmail.com",""),
              Role:"",
            };
      
            // Save user details to Firestore
            await setDoc(userRef, userDetails);
            console.log("User details saved to Firestore!");
            
            // Save UID in sessionStorage
            sessionStorage.setItem('userUID', user.uid); // Save the user ID
            
            // Redirect to user details page after saving
            window.location.href = "userDetails.html"; 
      
          } else {
            console.log("User already exists in Firestore, no need to save again.");
            
            // You can choose to update user details if needed, e.g., updating the profile photo if changed
            // Example of updating user's photoURL:
            // await setDoc(userRef, { photoURL: user.photoURL }, { merge: true });
            sessionStorage.setItem('userUID', user.uid); // Save the user ID
      
            // If user already exists, redirect to the user details page
            window.location.href = "home.html";  // Redirect to the user details page
          }




;

    } else {
      console.error("User is not in the allowedUsers collection.");
      alert("Your account does not exist. Please contact the admin or register first.");
    }

  } catch (error) {
    console.error("Error during sign-in:", error); // Log detailed error
    const errorMessage = error.message;
    alert(`Sign-in failed: ${errorMessage}`);
  }
});
