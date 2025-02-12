import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
import { getFirestore, collection,updateDoc,writeBatch,setDoc, doc, getDoc, query, orderBy, getDocs, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';
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
    window.location.href="/index.html";
} else {
    const userRef = doc(db, `company/${company}/users`, userUID);
    const userDoc = await getDoc(userRef);
    var userData = userDoc.data();
}

// 🔹 Get Online Time (IST)

// Fetch time before using it
timestamp: serverTimestamp() // Store Firebase server timestamp
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
                if(employeeData.EmployeeID!=userData.EmployeeID){
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
                            <div id="lastmes"></div>
                        </div>
                    </div>
                `;

                chatitem.onclick = () => chattingWith(employeeData);
                chatscon.appendChild(chatitem);
                }
            });
        } else {
            console.log("No employees found.");
        }
    } catch (error) {
        console.error("Error fetching employees:", error);
    }
}
displayAllEmployees();
let isSendButtonListenerAttached = false;

async function chattingWith(employeeData) {
    document.getElementById('profile').src = employeeData.photoURL || 'default.png';
    document.querySelector('.name').innerHTML = `${employeeData.name}`;
    document.getElementById('role').innerHTML = `${employeeData.Role}`;

    // 🔹 Create Chat Room ID
    const sortedIDs = [userData.EmployeeID, employeeData.EmployeeID].sort();
    const chatRoomID = `${sortedIDs[0]}_${sortedIDs[1]}`;

    
    // 🔹 Firestore Reference
    const messagesRef = collection(db, `company/${company}/OrbitConnect/${chatRoomID}/messages`);
    await markMessagesAsRead(chatRoomID);
    // Display Messages
    displayMessages(chatRoomID, employeeData);
document.getElementById("clearChat").addEventListener("click", () => {
        clearChatForUser(chatRoomID); // Call function with the active chat room ID
    });
    // Prevent duplicate event listeners
    if (!isSendButtonListenerAttached) {
        document.getElementById('send').addEventListener('click', () => sendMessage(messagesRef, employeeData));
        document.getElementById('textmessage').addEventListener("keydown", function (event) {
            if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault(); 
                sendMessage(messagesRef, employeeData);
            }
        });

        isSendButtonListenerAttached = true; // Mark as attached
    }
}
async function sendMessage(messagesRef, employeeData) {
    const textInput = document.getElementById('textmessage');
    const textMessage = textInput.value.trim();

    if (!textMessage) {
        alert("No message entered!");
        return;
    }

    try {
        // 🔹 Fetch IST Date & Time
        const response = await fetch("https://www.timeapi.io/api/Time/current/zone?timeZone=Asia/Kolkata");
        const data = await response.json();

        // Extract Date & Time
        const [month, day, year] = data.date.split("/");
        const formattedDate = `${day}-${month}-${year}`;
        const formattedTime = data.time.slice(0, 5); // Extract "HH:MM"

        // 🔹 Store in Firestore
        await addDoc(messagesRef, {
            senderID: userData.EmployeeID,
            receiverID: employeeData.EmployeeID,
            message: textMessage,
            Date: formattedDate,  // Store IST Date
            Time: formattedTime,  // Store IST Time
            timestamp: serverTimestamp(),
            read: false
        });

        textInput.value = ""; // Clear input after sending
    } catch (error) {
        console.error("Error fetching IST time:", error);
    }
}

let unsubscribeMessages = null; // Store the unsubscribe function
let unsubsnap=null;
async function displayMessages(chatRoomID, employeeData) {
    const chatContainer = document.getElementById("chat1");
    chatContainer.innerHTML = ""; // Clear previous messages
    document.getElementById('chat').style.display = "flex";
    const chatRoomRef = doc(db, `company/${company}/OrbitConnect`, chatRoomID);
    const chatRoomSnapshot = await getDoc(chatRoomRef);

    if (!chatRoomSnapshot.exists()) {
        // If the chat room does not exist, create it
        await setDoc(chatRoomRef, {
            createdAt: serverTimestamp(),
            members: [userData.EmployeeID, employeeData.EmployeeID]
        });
    }

    const messagesRef = collection(db, `company/${company}/OrbitConnect/${chatRoomID}/messages`);
    let lastSenderID = null;
    let lastMessageDate = null;
    let isInitialLoad = true;

    // 🔹 Unsubscribe from any previous listener before attaching a new one
    if (unsubscribeMessages) {
        unsubscribeMessages(); // Stop listening to the old chat room
    }

    // Attach a new listener to the correct chat room
    unsubscribeMessages = onSnapshot(query(messagesRef, orderBy("timestamp", "asc")), (snapshot) => {
        chatContainer.innerHTML = ""; // Clear chat before reloading messages

        snapshot.forEach((doc) => {
            const messageData = doc.data();
            const messageDiv = document.createElement("div");
            if (messageData.hiddenFor && messageData.hiddenFor.includes(userData.EmployeeID)) {
                return; // Skip this message
            }
            const messageDate = messageData.Date;
            if (messageDate !== lastMessageDate) {
                const dateSeparator = document.createElement("div");
                dateSeparator.classList.add("date-separator");
                dateSeparator.innerText = messageDate;
                chatContainer.appendChild(dateSeparator);
                lastMessageDate = messageDate;
            }

            let isFirstMessage = lastSenderID !== messageData.senderID;
            let readStatusIcon = messageData.read
            ? '<img id="check" src="/Images/check.png" class="tick-img">'  // ✅✅ Blue Double Check
            : '<img id="check" src="/Images/check1.png" class="tick-img">';        // Single Gray Tick


            if (messageData.senderID === userData.EmployeeID) {
                messageDiv.classList.add("msg", "right-msg");
                messageDiv.innerHTML = `

                    <div class="msg-img" style="background-image: url(${userData.photoURL}); visibility: ${isFirstMessage ? 'visible' : 'hidden'};"></div>
                    <div class="msg-bubble ${isFirstMessage ? "" : "no-tail"}" style="position: relative;">
                                <div class="msg-text">${messageData.message}</div>
                        <div class="msg-info-time">${messageData.Time}<span class="read-status">${readStatusIcon}</span>
</div>
                        <div class="msg-tail" style="display: ${isFirstMessage ? 'block' : 'none'};"></div>
                    </div>
                `;
            } else {
                messageDiv.classList.add("msg", "left-msg");
                messageDiv.innerHTML = `
                    <div class="msg-img" style="background-image: url(${employeeData.photoURL}); visibility: ${isFirstMessage ? 'visible' : 'hidden'};"></div>
                    <div class="msg-bubble ${isFirstMessage ? "" : "no-tail"}" style="position: relative;">
                        <div class="msg-text">${messageData.message}</div>
                        <div class="msg-info-time">${messageData.Time}</div>
                        <div class="msg-tail" style="display: ${isFirstMessage ? 'block' : 'none'};"></div>
                    </div>
                `;
            }

            chatContainer.appendChild(messageDiv);
            lastSenderID = messageData.senderID;
        });

        if (!isInitialLoad) {
            chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });
        } else {
            chatContainer.scrollTo({ top: chatContainer.scrollHeight });
        }

        isInitialLoad = false;
    });
}



async function markMessagesAsRead(chatRoomID) {
    const messagesRef = collection(db, `company/${company}/OrbitConnect/${chatRoomID}/messages`);
    const q = query(messagesRef, orderBy("timestamp", "asc"));
    if (unsubsnap) {
        unsubsnap(); // Stop listening to the old chat room
    }
    unsubsnap=onSnapshot(q, async (snapshot) => {
        snapshot.forEach(async (docSnap) => {
            const messageData = docSnap.data();

            if (messageData.receiverID === userData.EmployeeID && !messageData.read) {
                try {
                    await updateDoc(doc(db, `company/${company}/OrbitConnect/${chatRoomID}/messages`, docSnap.id), {
                        read: true
                    });
                } catch (error) {
                    console.error("Error updating read status:", error);
                }
            }
        });
    });
}


async function clearChatForUser(chatRoomID) {
    if (!confirm("Are you sure you want to clear the chat? This will not delete messages for the other user.")) return;

    try {
        const messagesRef = collection(db, `company/${company}/OrbitConnect/${chatRoomID}/messages`);
        const querySnapshot = await getDocs(messagesRef);

        // Update each message to mark it as hidden for the current user
        const batch = writeBatch(db);
        querySnapshot.forEach((docSnap) => {
            const messageData = docSnap.data();
            let hiddenFor = messageData.hiddenFor || []; 

            if (!hiddenFor.includes(userData.EmployeeID)) {
                hiddenFor.push(userData.EmployeeID);
            }

            batch.update(docSnap.ref, { hiddenFor: hiddenFor });
        });

        await batch.commit(); // Execute batch update

        // Clear chat UI for this user only
        document.getElementById("chat1").innerHTML = "";

        // alert("Chat cleared successfully for you. The other user will still see the messages.");
    } catch (error) {
        console.error("Error clearing chat:", error);
        alert("Failed to clear chat. Please try again.");
    }
}
