// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';

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
  signinButton.addEventListener('click', (e) => {
    e.preventDefault(); // Prevent default form submission

    const emailInput = document.getElementById('signinEmail');
    const passwordInput = document.getElementById('signinPassword');
    const email = emailInput.value;
    const password = passwordInput.value;

    // Remove and re-add the shake class to restart the animation
    const triggerShake = (input) => {
      input.classList.remove('shake');
      void input.offsetWidth; // Trigger a reflow
      input.classList.add('shake');
    };

    if (!email || !password) {
      // alert("Please enter both email and password.");
      triggerShake(emailInput);
      triggerShake(passwordInput);



      return;
    }

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log(user);
        alert("Logged in successfully!");

        
        // sessionStorage.setItem('user', JSON.stringify(user));
      
      // Redirect to new HTML page
      window.location.href = "home.html";  // Redirect to the user details page
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(errorCode, errorMessage);

        // Trigger shake effect on incorrect input fields
        if (errorCode === 'auth/invalid-email') {
          triggerShake(emailInput);
          // triggerShake(passwordInput);
        }
        if(errorCode==="auth/invalid-login-credentials"){
          triggerShake(passwordInput);


        }

        
         else {
          // alert(`Error: ${errorMessage}`);
        }
      });
  });
} else {
  console.error("Sign-In button not found in the DOM.");
}
