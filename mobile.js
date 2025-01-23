import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
import { getFirestore, doc, setDoc } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyCib5ywnEJvXXIePdWeKZtrKMIi2-Q_9sM",
  authDomain: "geo-orbit-ed7a7.firebaseapp.com",
  projectId: "geo-orbit-ed7a7",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Store the user object once authenticated
let currentUser = null;

// Listen to authentication state changes and store the user
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    console.log("Auth state changed. Current user:", user);
  } else {
    console.log("No user signed in.");
    currentUser = null;
  }
});

// Update button event listener
const update = document.getElementById('updatebutton');
update.addEventListener('click', async () => {
  const mobileInput = document.getElementById('mobilenumber').value;

  if (!mobileInput) {
    alert("Please enter a valid mobile number.");
    return;
  }

  if (!currentUser) {
    alert("Please sign in to update your mobile number.");
    // window.location.href = "userDetails.html"; 

    return;
  }

  console.log("User is authenticated. Proceeding to update mobile number.");

  try {
    const userRef = doc(db, 'users', currentUser.uid); // Get reference to user document
    console.log("Firestore document reference:", userRef);

    // Attempt to update the mobile number field in Firestore
    const result = await setDoc(userRef, { mobileNumber: mobileInput }, { merge: true });

    // Check if the update was successful
    console.log("Update result:", result);  // Check if result is undefined or successful

    alert("Mobile number updated successfully!");
    console.log("Mobile number updated successfully!");


    // Optionally, you can redirect after updating
    window.location.href = "userDetails.html"; 

  } catch (error) {
    console.error("Error updating mobile number:", error);
    alert("Failed to update mobile number. Please try again.");
    // window.location.href = "userDetails.html"; 


  }
});
