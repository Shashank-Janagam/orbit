// / Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
import { getFirestore, collection,updateDoc,writeBatch,setDoc,onSnapshot, doc, getDoc,where, query, orderBy, getDocs, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

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



// File where the user details are displayed (e.g., userDetails.js)
const userUID = sessionStorage.getItem('userUID');
const company=sessionStorage.getItem('company');
const rdevice=sessionStorage.getItem('rdevice');
let userData=null;
if(rdevice=="false"){
  // alert("not a registered device",rdevice);
  document.getElementById('detect').style.display="none";
}
if (!userUID) {
  console.log("No user is authenticated!");
  alert("Please sign in to proceed.");
  window.location.href = "/index.html"; // Redirect to login page
} else {
  console.log("User is authenticated with UID:", userUID);
  // Fetch user data from Firestore using userUID
  const userRef = doc(db, `company/${company}/users`, userUID);
  const cref=doc(db,`company/${company}`);

  try {
    const userDoc = await getDoc(userRef);
    const cdoc=await getDoc(cref);
    const cdata=cdoc.data();
    document.getElementById("clogo").src=cdata.clogo;
    document.getElementById('clogo').style.display='block';

    if (userDoc.exists()) {
      // User data exists, retrieve and display it
       userData = userDoc.data();
      console.log("User data:", userData);

    
      document.getElementById("logo").src = userData.photoURL || "default-profile-pic.png"; // Fallback to default image
      // console.log(userData.age);
    } else {
      console.log("No user data found in Firestore.");
    }
  } catch (error) {
    console.error("Error fetching user data from Firestore:", error);
    alert(error);
  }
 
  // Display the user details...
}


const notificationSound = new Audio("/Images/notifi.mp3"); // Place a valid audio file in your project

async function listenForUserMessages() {
    try {
        const chatRoomsRef = collection(db, `company/${company}/OrbitConnect`);
        const q = query(chatRoomsRef);

        const querySnapshot = await getDocs(q);
        console.log("Total chat rooms found:", querySnapshot.size);

        querySnapshot.forEach((chatRoomDoc) => {
            const chatRoomID = chatRoomDoc.id;
            const chatRoomData = chatRoomDoc.data();

            if (chatRoomData.members && chatRoomData.members.includes(userData.EmployeeID)) {
                console.log("Listening for messages in chat room:", chatRoomID);

                const messagesRef = collection(db, `company/${company}/OrbitConnect/${chatRoomID}/messages`);
                onSnapshot(query(messagesRef, orderBy("timestamp", "asc")), async (snapshot) => {
                    snapshot.docChanges().forEach(async (change) => {
                        if (change.type === "added") {
                            const messageData = change.doc.data();
                            console.log("New message received:", messageData);
                            setTimeout(async () => {},5000);

                            if (messageData.receiverID === userData.EmployeeID && !messageData.read && !messageData.notified) {
                                console.log("Triggering notification for:", messageData.message);

                                // Fetch sender details
                                const senderQuery = query(
                                    collection(db, `company/${company}/users`),
                                    where("EmployeeID", "==", messageData.senderID)
                                );
                                notificationSound.play().catch(error => console.log("Audio play blocked:", error));

                                const senderSnapshot = await getDocs(senderQuery);

                                let senderData = {
                                    name: "Unknown Sender",
                                    photoURL: "https://via.placeholder.com/40"
                                };

                                if (!senderSnapshot.empty) {
                                    senderSnapshot.forEach(doc => {
                                        senderData = doc.data();
                                    });
                                }

                                // Trigger the toast notification with message details
                                showToast(senderData.name, senderData.photoURL, messageData.message);
                                  try {
                                    await updateDoc(doc(db, `company/${company}/OrbitConnect/${chatRoomID}/messages`, change.doc.id), {
                                        notified: true
                                    });
                                } catch (error) {
                                    console.error("Error updating read status:", error);
                                }
                            }
                        }
                    });
                });
            }
        });
    } catch (error) {
        console.error("Error listening for user messages:", error);
    }
}

// Function to show toast notification
function showToast(senderName, senderPhoto, messageText) {
    let toast = document.getElementById("toast");
    if (!toast) {
        console.error("Toast element not found!");
        return;
    }

  // Update toast content dynamically
  const trimmedMessage = messageText.length > 15 ? messageText.substring(0, 15) + "..." : messageText;

  document.querySelector(".notification-user-avatar").src = senderPhoto;
  document.querySelector(".notification-text strong").innerText = senderName;
  document.querySelector(".mestxt").innerHTML=trimmedMessage;
    // Show notification with animation
    toast.style.display = "block";
    setTimeout(() => {
        toast.style.transform = "translateY(0)";
    }, 100);

    // Auto-hide after 5 seconds
    setTimeout(hideToast, 5000);
}

function hideToast() {
    let toast = document.getElementById("toast");
    if (toast) {
        toast.style.transform = "translateY(200%)";
        setTimeout(() => {
            toast.style.display = "none";
        }, 500);
    }
}

// Start Listening for Messages
// listenForUserMessages();


// // Check if user is authenticated
// onAuthStateChanged(auth, async (user) => {
//   if (!user) {
//     console.log("No user is authenticated!");
//     // alert("Please sign in to proceed.");
//     window.location.href="/index.html";
//   } else {
//     console.log("Authenticated user:", user.uid);

//     // Now, fetch user data from Firestore
//     const userRef = doc(db, "users", user.uid); // Reference to the user's document
//     try {
//       const userDoc = await getDoc(userRef);
      
//       if (userDoc.exists()) {
//         // User data exists, retrieve and display it
//         const userData = userDoc.data();
//         console.log("User data:", userData);

      
//         document.getElementById("logo").src = userData.photoURL || "default-profile-pic.png"; // Fallback to default image
        
//         // console.log(userData.age);
//       } else {
//         console.log("No user data found in Firestore.");
//       }
//     } catch (error) {
//       console.error("Error fetching user data from Firestore:", error);
//       alert(error);
//     }
//   }
// });
