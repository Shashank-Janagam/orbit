// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';


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

function generateDeviceID() {
  const userAgent = navigator.userAgent; // User's browser/device info
  const platform = navigator.platform; // OS/platform info
  const randomSalt = "random_salt_value"; // Add a salt for uniqueness
  const rawID = `${userAgent}-${platform}-${randomSalt}`;
  // const rawID=`${userAgent}`;
  return btoa(rawID); // Encode to create a unique identifier
}


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

         // Query the allowedUsers collection for the authenticated user's UID
         const allowedUsersRef = collection(db, 'allowedUsers');
         const allowedmanagerRef=collection(db,'allowedManagers');
     
         const q = query(allowedUsersRef, where('uid', '==', user.email.replace("@gmail.com", "")));
         const p = query(allowedmanagerRef, where('uid','==', user.email.replace("@gmail.com","")));
         const querySnapshot = await getDocs(q);
         const pmanagers= await getDocs(p);
     
         if (!querySnapshot.empty) { // If user UID exists in allowedUsers
           console.log("User is allowed to log in.");
     
           // const data1 = querySnapshot.docs[0].data();
     
           const userRef = doc(db, 'users', user.uid);
     
           // Check if the user already exists in Firestore
           const userDoc = await getDoc(userRef);
     
           // Generate the current device ID
           const currentDeviceID = generateDeviceID();
     
          //  if (userDoc.exists()) {
             const userData = userDoc.data();
     
             // Check if the device ID matches the stored device IDgit
             if (userData.deviceID && userData.deviceID !== currentDeviceID) {
               console.error("You can only log in from the device you initially used.");
               window.location.href = "notuser.html"; // Redirect to a page showing the device restriction message
               return;
             }
          //  } else {
     
     
     
           // Save UID in sessionStorage
           sessionStorage.setItem('userUID', user.uid);
           window.location.href = userDoc.exists() ? "home.html" : "userDetails.html";
     
         }
         else if(!pmanagers.empty){
     
           console.log("Manager is allowed to log in.");
          
           
           // Save UID in sessionStorage
           sessionStorage.setItem('userUID', user.uid);
           window.location.href = "mhome.html";
     
            
           
     
           
     
     
         }
          else {
           console.error("User is not in the allowedUsers collection.");
           window.location.href = "notuser.html"; // Redirect to a page indicating the user is not allowed
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
