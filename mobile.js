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

// Log current user immediately
console.log("Auth current user at start:", auth.currentUser);

// Update button event listener
document.getElementById('updatebutton').addEventListener('click', async () => {
  const mobileInput = document.getElementById('mobilenumber').value;

  if (!mobileInput) {
    alert("Please enter a valid mobile number.");
    return;
  }

  // Listen for authentication state
  onAuthStateChanged(auth, async (user) => {
    console.log("Auth state changed. Current user:", user);

    if (!user) {
      alert("Please sign in to update your mobile number.");
    } else {
      console.log("Updating mobile number for user:", user.uid);
      const userRef = doc(db, 'users', user.uid);
      try {
        // Ensure the document exists and update the mobile number
        await setDoc(userRef, { mobileNumber: mobileInput }, { merge: true });
        
        alert("Mobile number updated successfully!");

        // Redirect to the user details page after updating
        window.location.href = "userDetails.html"; 

      } catch (error) {
        console.error("Error updating mobile number:", error);
        alert("Failed to update mobile number. Please try again.");
        window.location.href = "userDetails.html"; 

      }
    }
  });
});


