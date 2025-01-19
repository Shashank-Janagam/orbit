import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';

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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.addEventListener('DOMContentLoaded', () => {
  const signupButton = document.getElementById('signupButton');
  if (signupButton) {
    signupButton.addEventListener('click', (e) => {
      e.preventDefault(); // Prevent form submission

      const emailInput = document.getElementById('signupEmail');
      const passwordInput = document.getElementById('signupPassword');
      const email = emailInput.value;
      const password = passwordInput.value;

      const triggerShake = (input) => {
        input.classList.remove('shake'); // Remove existing animation
        void input.offsetWidth; // Trigger reflow to restart the animation
        input.classList.add('shake'); // Add the animation class
      };

      if (!email || !password) {
        triggerShake(emailInput);
        triggerShake(passwordInput);
        return;
      }

      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          console.log(user);
          alert("Signed up successfully!");
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
        //   console.error(errorCode, errorMessage);
          alert(`Error: ${errorMessage}`);
        });

        if(errorcode==='auth/email-already-in-use'){
            const logo=document.getElementById('log');
            log.textcontent="";
            log.textcontent="User alredy In use";
        }
    });
  } else {
    console.error("Sign-Up button not found in the DOM.");
  }
});
