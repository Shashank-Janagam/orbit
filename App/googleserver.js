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


function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

// Canvas Fingerprinting
function generateCanvasFingerprint() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.textBaseline = "top";
  ctx.font = "14px 'Arial'";
  ctx.fillText('Hello World!', 2, 2);
  const data = canvas.toDataURL();
  return hashString(data);
}

// WebGL Fingerprinting
function getWebGLFingerprint() {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
  const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
  return hashString(renderer + vendor);
}

// Store the fixed font list at the time of registration
const fixedFontList = [
  "Arial", "Verdana", "Courier New", "Georgia", "Times New Roman", "Tahoma", "Trebuchet MS"
];

// Gathering all data for fingerprint
function generateFingerprint() {
  const userAgent = navigator.userAgent;
  const platform = navigator.platform;
  const screenRes = `${screen.width}x${screen.height}`;
  const fonts = fixedFontList.join(','); // Use the fixed font list
  const canvasFingerprint = generateCanvasFingerprint();
  const webglFingerprint = getWebGLFingerprint();

  const fingerprintData = `${userAgent}-${platform}-${screenRes}-${fonts}-${canvasFingerprint}-${webglFingerprint}`;
  return hashString(fingerprintData);
}

// Display fingerprint

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

      if (userDoc.exists()) {
        const biometricSuccess = await verifyBiometric();
    
        if (!biometricSuccess) {
            alert("Biometric registration failed. Please try again.");
            return; // ❌ Prevent redirection if biometric fails
          }  
        const userData = userDoc.data();
        const finger=generateFingerprint();
        console.log(finger);
        console.log(userData.DeviceId);


      // Save UID in sessionStorage
      sessionStorage.setItem('userEmail', user.email);
      sessionStorage.setItem('userUID', user.uid);
      window.location.href="/Employee/home.html";
    
     
      } else {
        const fingerprint = generateFingerprint();
        const biometricSuccess = await registerBiometric();
    
        if (!biometricSuccess) {
            alert("Biometric registration failed. Please try again.");
            return; // ❌ Prevent redirection if biometric fails
          }                    // If the us
        // er is logging in for the first time, register their device
        const userDetails = {
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          EmployeeID: user.email.replace("@gmail.com", ""),
          Role: cmpdata.Role,
          Company: companyName,
          DeviceId:fingerprint,
          Dob:cmpdata.Dob,
          mobileNumber:cmpdata.mobile, // Store the device ID
        };

        console.log("User not found in Firestore, saving details...");
        await setDoc(userRef, userDetails);
        console.log("User details saved to Firestore!");

        console.log("Login event recorded in Firestore.");

      // Save UID in sessionStorage
      sessionStorage.setItem('userEmail', user.email);

      sessionStorage.setItem('userUID', user.uid);
      window.location.href = userDoc.exists() ? "/Employee/home.html" : "/Employee/userDetails.html";
      }

    

  
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
        const biometricSuccess = await registerBiometric();
    
        if (!biometricSuccess) {
            alert("Biometric registration failed. Please try again.");
            return; // ❌ Prevent redirection if biometric fails
          } 

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
        
        sessionStorage.setItem('userEmail', user.email);
        sessionStorage.setItem('company',companyName);
  
        sessionStorage.setItem('userUID', user.uid);
        window.location.href = "/Manager/mhome.html";
        
      }else{
        // / Log successful login in Firestore
        const biometricSuccess = await verifyBiometric();
    
        if (!biometricSuccess) {
            alert("Biometric registration failed. Please try again.");
            return; // ❌ Prevent redirection if biometric fails
          }  
      // Save UID in sessionStorage
      sessionStorage.setItem('userEmail', user.email);
      sessionStorage.setItem('company',companyName);

      sessionStorage.setItem('userUID', user.uid);
      window.location.href = "/Manager/mhome.html";
      }

       


      


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
  }, 500); // Delay for 1 second
};


async function registerBiometric() {
  if (!window.PublicKeyCredential) {
      alert("WebAuthn is not supported in this browser.");
      return false;
  }

  const challenge = new Uint8Array(32);
  window.crypto.getRandomValues(challenge);

  const options = {
      publicKey: {
          challenge: challenge,
          rp: { name: "GeoOrbit" },
          user: {
              id: new Uint8Array(16), // Must be consistent
              name: auth.currentUser ? auth.currentUser.email : "guest",
              displayName: auth.currentUser ? auth.currentUser.displayName : "Guest User"
          },
          pubKeyCredParams: [{ type: "public-key", alg: -7 }], // ECDSA with SHA-256
          authenticatorSelection: {
              authenticatorAttachment: "platform",
              userVerification: "required"
          },
          timeout: 60000,
      }
  };

  try {
      const credential = await navigator.credentials.create(options);
      if (!credential) {
          alert("Failed to create credential.");
          return false;
      }

      const credentialID = btoa(String.fromCharCode(...new Uint8Array(credential.rawId))); // Convert to base64
      console.log("Credential ID:", credentialID);

      // ✅ Store the credential ID in Firestore
      const userRef = doc(db, "biometricData", auth.currentUser.uid);
      await setDoc(userRef, { credentialID: credentialID });

      alert("Biometric registered successfully!");
      return true;
  } catch (error) {
      console.error("Error during biometric registration:", error);
      alert("Biometric registration failed.");
      return false;
  }
}

async function verifyBiometric() {
  if (!window.PublicKeyCredential) {
      alert("WebAuthn is not supported in this browser.");
      return false;
  }

  const user = auth.currentUser;
  if (!user) {
      alert("User is not authenticated.");
      return false;
  }

  // 🔍 Fetch the stored credential ID from Firestore
  const userRef = doc(db, "biometricData", user.uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
      alert("No biometric data found. Please register first.");
      logout();
      window.location.href="/index.html";
      return false;
  }

  const storedCredentialID = userDoc.data().credentialID;
  console.log("Stored Credential ID:", storedCredentialID);

  const challenge = new Uint8Array(32);
  window.crypto.getRandomValues(challenge);

  const options = {
      publicKey: {
          challenge: challenge,
          allowCredentials: [{
              id: Uint8Array.from(atob(storedCredentialID), c => c.charCodeAt(0)), // Convert back from base64
              type: "public-key"
          }],
          timeout: 60000,
          userVerification: "required"
      }
  };

  try {
      const assertion = await navigator.credentials.get(options);
      if (!assertion) {
          alert("Authentication failed.");
          logout();
          window.location.href="/index.html";
          return false;
      }

      const assertionID = btoa(String.fromCharCode(...new Uint8Array(assertion.rawId))); // Convert assertion ID to base64
      console.log("Assertion ID:", assertionID);

      // ✅ Check if the assertion ID matches the stored credential ID
      if (assertionID !== storedCredentialID) {
          alert("Unauthorized biometric detected! Stored ID and assertion ID do not match.");
          logout();
          window.location.href="/index.html";
          return false;
      }

      console.log("Biometric verification successful!");
      window.location.href = "/Employee/home.html"; // ✅ Redirect after success
      return true;
  } catch (error) {
      console.error("Biometric authentication failed:", error);
      alert("Biometric authentication failed. Please try again.");
      logout();
      window.location.href="/index.html";
      return false;
  }
}
async function logout(){
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
}