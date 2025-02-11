import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
import { getFirestore, collection, doc, getDoc, query, orderBy, getDocs, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';
import { onSnapshot } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

// 🚀 Firebase Configuration
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

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 🔹 Get Logged-in User Info
const company = sessionStorage.getItem('company');
const userUID = sessionStorage.getItem('userUID');

if (!company || !userUID) {
    alert("User not authenticated!");
} else {
    const userRef = doc(db, `company/${company}/users`, userUID);
    const userDoc = await getDoc(userRef);
    var userData = userDoc.data();
}

// 🔹 Get Online Time (IST)
let formattedDate = null;

async function fetchCurrentISTTime() {
    try {
        const response = await fetch("https://www.timeapi.io/api/Time/current/zone?timeZone=Asia/Kolkata");
        const data = await response.json();

        // Convert "YYYY-MM-DD" to "DD-MM-YYYY"
        const [month, day, year] = data.date.split("/");
        formattedDate = `${day}-${month}-${year}`;

        console.log("IST Time:", formattedDate);
    } catch (error) {
        console.error("Error fetching time:", error);
    }
}

// Fetch time before using it
await fetchCurrentISTTime();

const chatscon = document.querySelector('.chats');

// 🔹 Display All Employees
async function displayAllEmployees() {
    try {
        const usersCollection = collection(db, `company/${company}/users`);
        const querySnapshot = await getDocs(usersCollection);

        if (!querySnapshot.empty) {
            chatscon.innerHTML = ""; 

            querySnapshot.forEach(doc => {
                const employeeData = doc.data();
                const employeeName = employeeData.name || "Not provided";
                const photo = employeeData.photoURL || 'default.png';

                const chatitem = document.createElement("div");
                chatitem.classList.add("chat-item");
                chatitem.innerHTML = `
                    <div class="chat-details">
                        <div id="img">
                            <img id="profile-pic" src="${photo}" alt="Profile Picture" class="profile-pic">
                        </div>
                        <div id="det">
                            <div id="name">${employeeName}</div>
                            <div id="lastmes">Hello</div>
                        </div>
                    </div>
                `;

                chatitem.onclick = () => chattingWith(employeeData);
                chatscon.appendChild(chatitem);
            });
        } else {
            console.log("No employees found.");
        }
    } catch (error) {
        console.error("Error fetching employees:", error);
    }
}
displayAllEmployees();

// 🔹 Open Chat with Employee
async function chattingWith(employeeData) {
    document.getElementById('profile').src = employeeData.photoURL || 'default.png';
    document.querySelector('.name').innerHTML = `${employeeData.name}`;

    // 🔹 Create Chat Room ID
    const sortedIDs = [userData.EmployeeID, employeeData.EmployeeID].sort();
    const chatRoomID = `${sortedIDs[0]}_${sortedIDs[1]}`;

    // 🔹 Firestore Reference (Storing Messages by Date)
    const messagesRef = collection(db, `company/${company}/OrbitConnect/${chatRoomID}/messages`);

    displayMessages(chatRoomID);

    document.getElementById('send').addEventListener('click', async () => {
        const textInput = document.getElementById('textmessage');
        const textMessage = textInput.value.trim();

        if (!textMessage) {
            alert("No message entered!");
            return;
        }

        try {

            await addDoc(messagesRef, {
                senderID: userData.EmployeeID,
                receiverID: employeeData.EmployeeID,
                message: textMessage,
                Date:formattedDate,
                timestamp: serverTimestamp()
            });

            textInput.value = ""; // Clear input after sending
        } catch (error) {
            console.error("Error sending message:", error);
        }
    });
}

// 🔹 Display Messages from All Dates// 🔹 Display Messages from All Dates
async function displayMessages(chatRoomID) {const chatContainer = document.getElementById("chat1");
  chatContainer.innerHTML = ""; // Clear previous messages

  const messagesRef = collection(db, `company/${company}/OrbitConnect/${chatRoomID}/messages`);

  // 🔹 Listen for real-time message updates
  onSnapshot(query(messagesRef, orderBy("timestamp", "asc")), (snapshot) => {
      chatContainer.innerHTML = ""; // Clear chat before reloading messages

      snapshot.forEach(doc => {
          const messageData = doc.data();

          const messageDiv = document.createElement("div");

          // 🔹 If the logged-in user is the sender, align RIGHT (sent)
          if (messageData.senderID === userData.EmployeeID) {
              messageDiv.classList.add("message", "sent");
          }
          // 🔹 If the logged-in user is the receiver, align LEFT (received)
          else {
              messageDiv.classList.add("message", "received");
          }

          messageDiv.innerHTML = `
              <div class="message-bubble">
                  <p>${messageData.message}</p>
                  <span class="timestamp">${formatTimestamp(messageData.timestamp)}</span>
              </div>
          `;

          chatContainer.appendChild(messageDiv);
      });

      // 🔹 Auto-scroll to bottom on new messages
      chatContainer.scrollTop = chatContainer.scrollHeight;
  });
}

// 🔹 Format Firestore Timestamp
function formatTimestamp(timestamp) {
    if (!timestamp) return "Just now";
    const date = timestamp.toDate();
    return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
}
