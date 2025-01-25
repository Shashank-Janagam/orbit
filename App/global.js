import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const auth = getAuth();

// Check if the user is logged in and add the event listener
auth.onAuthStateChanged((user) => {
  if (user) {
    // console.log("User is logged in:", user.uid);

    // Add event listener for window/tab close
    window.addEventListener("beforeunload", (event) => {
      if (auth.currentUser) {
        // Sign out the user
        signOut(auth)
          .then(() => {
            console.log("User has been logged out automatically.");
          })
          .catch((error) => {
            console.error("Error logging out the user:", error);
          });
      }
    });
  } else {
    console.log("No user is logged in.");












  }
});
