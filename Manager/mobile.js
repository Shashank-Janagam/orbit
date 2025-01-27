// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
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
const db = getFirestore(app); // Initialize Firestore

const userUID = sessionStorage.getItem('userUID');
const company = sessionStorage.getItem('company');

// Check if user data exists in sessionStorage
if (userUID && company) {
  console.log("Session userUID:", userUID);
  console.log("Session company:", company);

  // Add event listener for the update button
  const update = document.getElementById('updatebutton');
  update.addEventListener('click', async (event) => {
    event.preventDefault(); // Prevent the default form submission behavior

    const mobileInput = document.getElementById('mobilenumber').value;

    if (!mobileInput) {
      alert("Please enter a valid mobile number.");
      return;
    }

    console.log("Updating mobile number for:", userUID);

    try {
      // Reference the Firestore document
      const userRef = doc(db, `company/${company}/managers`, userUID);
      console.log("Firestore document reference:", userRef);

      // Update the mobile number field in Firestore
      await setDoc(userRef, { mobileNumber: mobileInput }, { merge: true });

      alert("Mobile number updated successfully!");
      console.log("Mobile number updated successfully!");

      // Redirect after updating
      window.location.href = "userDetails.html";
    } catch (error) {
      console.error("Error updating mobile number:", error);
      alert("Failed to update mobile number. Please try again.");
    }
  });
} else {
  console.error("Session storage data is missing.");
  alert("Session expired. Please log in again.");
  // window.location.href = "login.html"; // Uncomment to redirect to login page
}
