// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';
import { signOut } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
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
const db = getFirestore(app); // Initialize Firestore


const logoutButton = document.getElementById('logoutButton');

// Add an event listener to the logout button
logoutButton.addEventListener('click', async () => {
  try {
    await signOut(auth); // Sign out the user
    console.log("User successfully logged out.");
    
    // Clear sessionStorage
    sessionStorage.removeItem('userUID');
    
    // Redirect to the login page
    window.location.href = "/index.html";
  } catch (error) {
    console.error("Error during logout:", error);
    alert("Logout failed. Please try again.");
  }
});

const resetPasswordButton = document.getElementById('reset');
resetPasswordButton.addEventListener('click', async (e) => {
  e.preventDefault();
  onAuthStateChanged(auth, async (user) => {

    const company=sessionStorage.getItem('company');
const userUID = sessionStorage.getItem('userUID');

    const userRef = doc(db, `company/${company}/managers`, userUID);

  const userDoc = await getDoc(userRef);
  const userData = userDoc.data();



  // const emailInput = document.getElementById('resetEmail');
  const email = userData.email;

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
    // alert("Password reset link sent to your email!");
    const textDiv = document.getElementById('sent');
    textDiv.textContent="Password reset link sent to your email!";
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
  }})
});


const company=sessionStorage.getItem('company');

const userUID=sessionStorage.getItem('userUID');
if (!userUID) {
  console.log("No user is authenticated!");
  alert("Please sign in to proceed.");
  window.location.href = "/index.html"; // Redirect to login page
} else {
  console.log("User is authenticated with UID:", userUID);
  const pro=document.getElementById('profile');
  
  // Fetch user data from Firestore using userUID
  const userRef = doc(db, `company/${company}/managers`, userUID);
  const userDoc = await getDoc(userRef);
  const userData = userDoc.data();

  const imgElement = document.getElementById('userPhoto');
    
  // Set the image source to the fetched URL
  imgElement.src = userData.photoURL;

  // Make the image visible after it's loaded
  imgElement.onload = function() {
    imgElement.style.display = 'block';   // Ensure it's visible
    imgElement.style.opacity = 1;   
  };
  

  document.getElementById("userName").innerText = userData.name || "Not provided";
  document.getElementById("userEmail").innerText = userData.email || "Not provided";
  // document.getElementById("userPhoto").src = userData.photoURL || "default-profile-pic.png"; // Fallback to default image
  document.getElementById("dob").innerText = "Date of birth: "+userData.Dob;
  document.getElementById("userMobile").innerText = "Mobile: "+userData.mobileNumber || "Not provided";
  document.getElementById('role').innerText=userData.Role|| "";
  document.getElementById('company').innerText=userData.Company|| "";
  setTimeout(() => {
    // console.log('This will be logged after 2 seconds');
   // 2000 ms = 2 seconds
pro.style.display='block';
  pro.style.opacity=1;
}, 475);
  // Display the user details...
}
