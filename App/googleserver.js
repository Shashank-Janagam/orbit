// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { getAuth, signOut,GoogleAuthProvider, signInWithPopup } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
import { getFirestore, doc, getDoc, collection, getDocs, query, where, setDoc, addDoc } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

// Replace with your actual Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCib5ywnEJvXXIePdWeKZtrKMIi2-Q_9sM",
  authDomain: "geo-orbit-ed7a7.firebaseapp.com",
  databaseURL: "https://geo-orbit-ed7a7-default-rtdb.firebaseio.com",
  projectId: "geo-orbit-ed7a7",
  storageBucket: "geo-orbit-ed7a7.appspot.com",
  messagingSenderId: "807202826514",
  appId: "1:807202826514:web:5630f581f6f9dff46aebcb",
  measurementId: "G-H15DN69132"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // Initialize Firestore

// Function to generate a unique device identifier
function generateDeviceID() {
  const userAgent = navigator.userAgent; // User's browser/device info
  const platform = navigator.platform; // OS/platform info
  const randomSalt = "random_salt_value"; // Add a salt for uniqueness
  const rawID = `${userAgent}-${platform}-${randomSalt}`;
  // const rawID=`${userAgent}`;
  return btoa(rawID); // Encode to create a unique identifier
}

// Function to handle Google Sign-In
async function handleSignIn() {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider); // Sign-in
    const user = result.user;

    // Query the allowedUsers collection for the authenticated user's UID
    const allowedUsersRef = collection(db, 'allowedUsers');
    const allowedmanagerRef=collection(db,'allowedManagers');

    const q = query(allowedUsersRef, where('uid', '==', user.email.replace("@gmail.com", "")));
    const p = query(allowedmanagerRef, where('uid','==', user.email.replace("@gmail.com","")));
    const querySnapshot = await getDocs(q);
    const pmanagers= await getDocs(p);


    if (!querySnapshot.empty) { // If user UID exists in allowedUsers
      console.log("User is allowed to log in.");

      const cmpref=doc(db,'allowedUsers',user.email.replace("@gmail.com",""));
      const cmpDoc=await getDoc(cmpref);
      const cmpdata=cmpDoc.data();
      const companyName=cmpdata.company;

     sessionStorage.setItem('company',companyName);

      const userRef = doc(db, `company/${companyName}/users`, user.uid);

      // Check if the user already exists in Firestore
      const userDoc = await getDoc(userRef);

      // Generate the current device ID
      const currentDeviceID = generateDeviceID();

      if (userDoc.exists()) {
        const userData = userDoc.data();

        // Check if the device ID matches the stored device IDgit
        if (userData.deviceID && userData.deviceID !== currentDeviceID) {
          console.error("You can only log in from the device you initially used.");
          signOut(auth)
                    .then(() => {
                      console.log("User has been logged out automatically.");
                    })
                    .catch((error) => {
                      console.error("Error logging out the user:", error);
                    });
          sessionStorage.setItem('userUID', user.uid);
          sessionStorage.setItem('userEmail', user.email);


          window.location.href = "/invalidDevice.html"; // Redirect to a page showing the device restriction message

          return;
        }
      } else {
        // If the user is logging in for the first time, register their device
        const userDetails = {
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          EmployeeID: user.email.replace("@gmail.com", ""),
          Role: "Employee",
          Company: companyName,
          deviceID: currentDeviceID, // Store the device ID
        };

        console.log("User not found in Firestore, saving details...");
        await setDoc(userRef, userDetails);
        console.log("User details saved to Firestore!");
      }

      // Log successful login in Firestore
      const loginsRef = collection(db, "logins");
      await addDoc(loginsRef, {
        name: user.displayName,
        email: user.email,
        timestamp: new Date(), // Store login timestamp
      });

      console.log("Login event recorded in Firestore.");

      // Save UID in sessionStorage
      sessionStorage.setItem('userEmail', user.email);

      sessionStorage.setItem('userUID', user.uid);
      window.location.href = userDoc.exists() ? "/Employee/home.html" : "/Employee/userDetails.html";

    }
    else if(!pmanagers.empty){

      console.log("Manager is allowed to log in.");

      const cmpref=doc(db,'allowedManagers',user.email.replace("@gmail.com",""));
                const cmpDoc=await getDoc(cmpref);
                const cmpdata=cmpDoc.data();
                const companyName=cmpdata.company;
                 const userRef = doc(db, `company/${companyName}/managers`, user.uid);

      // Check if the user already exists in Firestore
      const userDoc = await getDoc(userRef);

      // Generate the current device ID
      // const currentDeviceID = generateDeviceID();

      if (!userDoc.exists()) {
        
 // If the user is logging in for the first time, register their device
        const userDetails = {
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          EmployeeID: user.email.replace("@gmail.com", ""),
          Role: "Manager",
          Dob:"",
          mobileNumber:"",
          Company:companyName,
          // Company: data1.company,
          // deviceID: currentDeviceID, // Store the device ID
        };

        console.log("User not found in Firestore, saving details...");
        await setDoc(userRef, userDetails);
        console.log("User details saved to Firestore!");
        

        
      }
        // / Log successful login in Firestore
      
      // Save UID in sessionStorage
      sessionStorage.setItem('userEmail', user.email);
      sessionStorage.setItem('company',companyName);

      sessionStorage.setItem('userUID', user.uid);
      window.location.href = "/Manager/mhome.html";

       


      


    }
     else {
      console.error("User is not in the allowedUsers collection.");
      window.location.href = "notuser.html"; // Redirect to a page indicating the user is not allowed
    }

  } catch (error) {
    console.error("Error during sign-in:", error);
    alert(error);
    window.location.href = "/index.html"; // Redirect to login page in case of error
  }
}

// Trigger the function on page load
window.onload = () => {
  setTimeout(() => {
    handleSignIn();
  }, 1000); // Delay for 1 second
};
