// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';
import { sendPasswordResetEmail } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';

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

// Manual Sign-In
const signinButton = document.getElementById('signinButton');
if (signinButton) {
  signinButton.addEventListener('click', async (e) => { // Make the event listener function async
    e.preventDefault(); // Prevent default form submission
  
    const emailInput = document.getElementById('signinEmail');
    const passwordInput = document.getElementById('signinPassword');
    const email = emailInput.value;
    const password = passwordInput.value;
  
    const triggerShake = (input) => {
      input.classList.remove('shake');
      void input.offsetWidth; // Trigger a reflow
      input.classList.add('shake');
    };
  
    if (!email || !password) {
      triggerShake(emailInput);
      triggerShake(passwordInput);
      return;
    }
  
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password); // Use await here
      const user = userCredential.user;
      console.log(user);
      // alert("Logged in successfully!");
  
      const db = getFirestore(app); // Initialize Firestore
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef); // Fetch the user document
  
      if (!userDoc.exists()) {
        console.log("User not found in Firestore, saving details...");
        const userDetails = {
          name: user.displayName || "Anonymous",
          email: user.email,
          photoURL: user.photoURL || "profile.png",
        };
  
        // Save user details to Firestore
        await setDoc(userRef, userDetails);
        console.log("User details saved to Firestore!");
  
        // Save UID in sessionStorage
        sessionStorage.setItem('userUID', user.uid);
  
        // Redirect to user details page after saving
        window.location.href = "userDetails.html";
      } else {
        console.log("User already exists in Firestore, no need to save again.");
        if(user.displayName=="Anonymous"){
          window.location.href="index.html";
        }
        else{
        window.location.href = "home.html"; // Redirect to the home page
        }
      }
    } catch (error) {
      console.error("Error during sign-in:", error);
      const errorCode = error.code;
  
      // Trigger shake effect on incorrect input fields
      if (errorCode === 'auth/invalid-email') {
        triggerShake(emailInput);
      } else if (errorCode === 'auth/wrong-password') {
        triggerShake(passwordInput);
      } else {
        console.error(`Error: ${error.message}`);
      }
    }
  });
  
} else {
  console.error("Sign-In button not found in the DOM.");
}



const resetPasswordButton = document.getElementById('forget');

resetPasswordButton.addEventListener('click', async (e) => {
  e.preventDefault();

  const emailInput = document.getElementById('signinEmail');
  const email = emailInput.value;

  const triggerShake = (input) => {
    input.classList.remove('shake');
    void input.offsetWidth; // Trigger a reflow
    input.classList.add('shake');
  };

  if (!email) {
    alert("Please enter your registered email.");
    triggerShake(emailInput);
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    alert("Password reset link sent to your email!");
  } catch (error) {
    console.error("Error sending password reset email:", error);
    const errorCode = error.code;

    if (errorCode === 'auth/user-not-found') {
      alert("No account found with this email.");
    } else if (errorCode === 'auth/invalid-email') {
      alert("Invalid email address. Please check and try again.");
      triggerShake(emailInput);
    } else {
      alert(`Error: ${error.message}`);
    }
  }
});
